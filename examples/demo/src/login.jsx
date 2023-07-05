/* eslint-disable no-console */
/* eslint-disable unicorn/no-useless-undefined */
import { useEffect, useState } from 'preact/hooks'
import { useOdd } from '@oddjs/preact/router'
import { ReactComponent as Logo } from './assets/brand.svg'

/**
 * Login page
 *
 * @param {import('preact').Attributes} props
 */
export default function Login(props) {
  const { isLoading, login, program } = useOdd({
    redirectTo: '/',
    redirectIfFound: true,
  })

  const [errorMsg, setErrorMsg] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  /** @type {import('preact/src/jsx.js').JSXInternal.GenericEventHandler<HTMLFormElement>} */
  async function onSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = /** @type {string | null} */ (formData.get('username'))

    if (!username) {
      setErrorMsg('Please enter a username')
      return
    }
    if (!(await program?.auth.isUsernameValid(username))) {
      setErrorMsg('Username is not valid')
      return
    }
    if (await program?.auth.isUsernameAvailable(username)) {
      setErrorMsg('No account for this username, you must register first')
      return
    }

    setIsLoggingIn(true)

    try {
      const session = await login(username)
      if (!session) {
        setErrorMsg('Login failed')
      }
    } catch (error) {
      console.error(error)
      // @ts-ignore
      setErrorMsg(error.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Trigger conditional UI
  useEffect(() => {
    async function run() {
      if (program) {
        try {
          await login()
          setErrorMsg('')
        } catch (error) {
          console.error(error)
          // @ts-ignore
          setErrorMsg(error.message)
        } finally {
          setIsLoggingIn(false)
        }
      }
    }

    run()
  }, [login, program])

  if (isLoading) {
    return <Logo class="pulse" style="margin: 0 auto; height: 50px;" />
  }

  return (
    <>
      <div className="login">
        <div class="ask">
          <Logo style="margin: 0 auto" />
          <p>Did you know it will be possible to encrypt data with a passkey? <em>When</em> your browser supports it.</p>
          <p>Help us achieve full browser compatibility. Track the &nbsp;
            <a
              href="https://github.com/oddsdk/passkeys/issues/13"
              target="_blank"
              rel="noreferrer"
            >
              current status of browser support
            </a>.</p>
          <p>Let’s see what this browser is capable of.</p>
        </div>
        <form autoComplete="on" onSubmit={onSubmit}>
          <label>
            <input
              type="text"
              name="username"
              placeholder="username"
              autoFocus
              autoComplete="username webauthn"
            />
          </label>

          <button type="submit" disabled={isLoggingIn}>
            Login
          </button>

          {errorMsg && <p className="error">{errorMsg}</p>}

          <p style="text-align: center">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </form>
        <div class="warning">
          <h3>Using a Chromium browser?</h3>
          <p>Navigate to{' '}
          <code>
            chrome://flags/#enable-experimental-web-platform-features
          </code>{' '}
          and enable it.</p>
        </div>

      </div>

      <style jsx>{`
        .login {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 24rem;
          margin: 0 auto;
        }
        form,
        label {
          display: flex;
          flex-flow: column;
          gap: 0.5rem;
        }
      `}</style>
    </>
  )
}
