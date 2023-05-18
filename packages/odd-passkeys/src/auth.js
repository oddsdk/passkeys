/* eslint-disable unicorn/no-null */
import * as ed from '@noble/ed25519'
import * as odd from '@oddjs/odd'
import { publicKeyToDid } from '@oddjs/odd/did/index'
import * as Session from '@oddjs/odd/session'
import { base64url } from 'iso-base/rfc4648'
import { utf8 } from 'iso-base/utf8'
import { u8 } from 'iso-base/utils'
import { credentialsCreate, credentialsGet } from 'iso-passkeys'
import * as Crypto from './crypto.js'
import { get, set } from 'idb-keyval'

/**
 * Create an encryption key from passkey material
 *
 * @param {BufferSource} keyMaterial
 */
export async function createEncryptionKey(keyMaterial) {
  const inputKeyMaterial = u8(keyMaterial)
  // import key material
  const keyDerivationKey = await crypto.subtle.importKey(
    'raw',
    inputKeyMaterial,
    'HKDF',
    false,
    ['deriveKey']
  )

  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      info: utf8.decode('webnative-passkey'),
      salt: new Uint8Array(), // TODO more salt
      hash: 'SHA-256',
    },
    keyDerivationKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )

  return encryptionKey
}

/**
 *
 * @param {import('@oddjs/odd').Configuration} config
 */
function rpFromConfig(config) {
  const host = document.location.host
  const id = host.split(':')[0]
  return typeof config.namespace === 'string'
    ? {
        name: config.namespace,
        id,
      }
    : {
        name: config.namespace.name,
        id,
      }
}

/**
 * Register passkey
 *
 * @param {string} username
 * @param {import('@oddjs/odd').Storage.Implementation} storage
 * @param {import('@oddjs/odd').Configuration} config
 */
async function registerPasskey(username, storage, config) {
  const rp = rpFromConfig(config)
  const credential = await credentialsCreate({
    publicKey: {
      challenge: base64url.encode(rp.id),
      rp,
      user: {
        id: username,
        name: username,
        displayName: username,
      },
      attestation: 'none',
      authenticatorSelection: {
        userVerification: 'required',
        requireResidentKey: true,
        residentKey: 'required',
      },
      extensions: {
        credProps: true,
        largeBlob: {
          support: 'preferred',
        },
        prf: {
          eval: {
            first: utf8.decode(rp.id + 'signing').buffer,
            second: utf8.decode(rp.id + 'encryption').buffer,
          },
        },
      },
    },
  })

  if (
    !credential.clientExtensionResults.prf ||
    credential.clientExtensionResults.prf?.enabled === false
  ) {
    throw new Error(
      'This browser does not support the Webauthn extensions (PRF) needed for this demo.'
    )
  }

  await set('passkeys', [credential])
  return credential
}

/**
 * Get passkey
 *
 * @param {import('@oddjs/odd').Configuration} config
 * @param {import('@oddjs/odd/components/storage/implementation').Implementation} storage
 * @param {import('iso-passkeys/types').CredentialMediationRequirement} [mediation]
 */
async function getPasskey(config, storage, mediation) {
  const rp = rpFromConfig(config)

  const credentials = await get('passkeys')

  const assertion = await credentialsGet({
    mediation,
    publicKey: {
      challenge: base64url.encode(rp.id),
      allowCredentials: mediation === 'conditional' ? [] : credentials,
      userVerification: 'required',
      rpId: rp.id,
      extensions: {
        // largeBlob: {
        //   // read: true,
        //   write: utf8.decode('hello world').buffer,
        // },
        prf: {
          eval: {
            first: utf8.decode(rp.id + 'signing').buffer,
            second: utf8.decode(rp.id + 'encryption').buffer,
          },
        },
      },
    },
  })

  if (
    !assertion.clientExtensionResults.prf ||
    !assertion.clientExtensionResults.prf.results
  ) {
    throw new Error('PRF not supported.')
  }

  // @ts-ignore
  const secret1 = assertion.clientExtensionResults.prf.results.first
  const secret2 = assertion.clientExtensionResults.prf.results.second

  const publicKey = await ed.getPublicKeyAsync(u8(secret1))

  if (!secret2) {
    throw new Error('PRF second secret not supported.')
  }
  const encryptionKey = await createEncryptionKey(secret2)
  await storage.setItem('passkey/encryption-key', encryptionKey)
  return {
    publicKey,
    assertion,
    privateKey: u8(secret1),
    userHandle: assertion.userHandle,
  }
}

/**
 * Login
 *
 * @param {import('@oddjs/odd/components/auth/implementation/base').Dependencies & {config: import('@oddjs/odd').Configuration;}} deps
 * @param {Awaited<ReturnType<getPasskey>>} [passkey]
 * @param {string} [username]
 */
export async function login(deps, passkey, username) {
  if (!passkey) {
    passkey = await getPasskey(
      deps.config,
      deps.storage,
      username ? undefined : 'conditional'
    )
  }

  const { privateKey, publicKey, userHandle } = passkey

  if (!username && !userHandle) {
    throw new Error('Username is required')
  }

  const crypto = await Crypto.implementation(deps.config, publicKey, privateKey)

  // Create an account UCAN
  const accountUcan = await odd.ucan.build({
    dependencies: {
      crypto,
    },
    potency: 'APPEND',
    resource: '*',
    lifetimeInSeconds: 60 * 60 * 24 * 30 * 12 * 1000, // a lot of time

    audience: await odd.did.ucan(deps.crypto),
    issuer: publicKeyToDid(crypto, publicKey, 'ed25519'),
  })

  // Save account UCAN
  await deps.storage.setItem(
    deps.storage.KEYS.ACCOUNT_UCAN,
    odd.ucan.encode(accountUcan)
  )

  await Session.provide(deps.storage, {
    type: 'Passkey',
    // @ts-ignore
    username: username || userHandle,
  })

  return passkey
}

/**
 * Register
 *
 * @param {import('@oddjs/odd/components/auth/implementation/base').Dependencies & {config: import('@oddjs/odd').Configuration;}} deps
 * @param {string} username
 */
export async function register(deps, username) {
  await registerPasskey(username, deps.storage, deps.config)

  const passkey = await getPasskey(deps.config, deps.storage)

  const registeAuth = odd.defaultAuthComponent({
    crypto: await Crypto.implementation(
      deps.config,
      passkey.publicKey,
      passkey.privateKey
    ),
    reference: deps.reference,
    storage: deps.storage,
  })
  const { success } = await registeAuth.register({ username })

  if (success) {
    return await login(deps, passkey, username)
  }
}

/**
 * Odd auth implementation
 *
 * @param {import('@oddjs/odd/components/auth/implementation/base').Dependencies & {config: import('@oddjs/odd').Configuration}} deps
 * @returns {import('@oddjs/odd/components/auth/implementation').Implementation<import('@oddjs/odd').Components>}
 */
export function implementation(deps) {
  const defaultAuth = odd.defaultAuthComponent(deps)
  return {
    type: 'Passkey',
    canDelegateAccount: defaultAuth.canDelegateAccount,
    createChannel: defaultAuth.createChannel,
    delegateAccount: defaultAuth.delegateAccount,
    isUsernameAvailable: defaultAuth.isUsernameAvailable,
    isUsernameValid: defaultAuth.isUsernameValid,
    linkDevice: defaultAuth.linkDevice,
    register: async ({ username }) => {
      if (!username) {
        await login(deps, undefined, username)
        return { success: true }
      }

      const isValid = await defaultAuth.isUsernameValid(username)

      if (isValid) {
        const isAvailable = await defaultAuth.isUsernameAvailable(username)
        if (isAvailable) {
          const passkey = await register(deps, username)
          return passkey ? { success: true } : { success: false }
        } else {
          await login(deps, undefined, username)
          return { success: true }
        }
      }

      return { success: false }
    },
    session: async (components, username, config, eventEmitters) => {
      // Check passkey signed UCAN
      const proof = await deps.storage.getItem(
        components.storage.KEYS.ACCOUNT_UCAN
      )
      if (!proof) {
        return null
      }

      return defaultAuth.session(components, username, config, eventEmitters)
    },
  }
}
