# ODD Passkeys using Preact

This example shows how to use the [ODD SDK](https://github.com/oddsdk/ts-odd) with [Passkeys](https://w3c.github.io/webauthn) authentication to build a simple Photo Gallery app.

It uses `vite`, `preact`, `preact-router`, `@oddjs/odd`, `@oddjs/preact` and `@oddjs/passkeys`.

## Try it

You can use Codesandbox <https://githubbox.com/oddsdk/passkeys/tree/main/examples/odd-passkeys-preact> and start hacking right away.

To clone it locally:

```bash
npx tiged oddsdk/passkeys/examples/odd-passkeys-preact odd-passkeys-preact
cd odd-passkeys-preact
pnpm install
pnpm dev
```

### Configuration

Open `src/app.jsx` and change the `config` object to match your app's namespace.

```js
/** @type {import('@oddjs/odd')} */
const config = {
  namespace: {
    creator: document.location.host,
    name: 'Passkey auth',
  },
}
```

## Publish it

An ODD application can be published to IPFS with the [Fission CLI](https://guide.fission.codes/developers/cli) or the [Fission GitHub publish action](https://github.com/fission-suite/publish-action).

**To publish with the Fission CLI:**

1. [Install the CLI](https://guide.fission.codes/developers/installation)
2. Run `fission setup` to make a Fission account
3. Run `pnpm run build` to build the app
4. Run `fission app register` to register a new Fission app (set your build directory to `dist`)

   ```bash
   fission app register --build-dir ./dist --name <your-app-name>
   ```

5. Run `fission app publish` to publish your app to the web

Your app will be available online at the domain assigned by the register command.

**To set up the GitHub publish action:**

1. Register the app with the CLI
2. Export your machine key with `base64 ~/.config/fission/key/machine_id.ed25519`
3. Add your machine key as a GH Repository secret named `FISSION_MACHINE_KEY`
4. Update the `publish.yml` with the name of your registered app

See the [Fission Guide](https://guide.fission.codes/developers/installation) and the publish action README for more details.

## Documention

- [ODD SDK](https://docs.odd.dev/)
- [UCANs](https://ucans.xyz/)
- [ODD passkeys](oddsdk.github.io/passkeys/)
