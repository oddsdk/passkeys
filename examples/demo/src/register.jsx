/* eslint-disable no-console */
/* eslint-disable unicorn/no-useless-undefined */
import { useState } from 'preact/hooks'
import { useOdd } from '@oddjs/preact/router'
import { ReactComponent as Logo } from './assets/brand.svg'

/**
 * Register page
 *
 * @param {import('preact').Attributes} props
 */
export default function Register(props) {
  const { isLoading, register, program } = useOdd({
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

    if (!(await program?.auth.isUsernameAvailable(username))) {
      setErrorMsg('Username is not available')
      return
    }

    setIsLoggingIn(true)
    try {
      const session = await register(username)
      if (!session) {
        setErrorMsg('Registration failed')
      }
    } catch (error) {
      console.error(error)
      // @ts-ignore
      setErrorMsg(error.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isLoading) {
    return <Logo class="pulse" style="margin: 0 auto; height: 50px;" />
  }

  return (
    <>
      <div className="login">
        <Logo style="margin: 0 auto; height: 50px;" />
        <form autoComplete="on" onSubmit={onSubmit}>
          <label>
            <input
              type="text"
              name="username"
              placeholder="username"
              autoFocus
              autoComplete="username webauthn"
              required
            />
          </label>
          {errorMsg && <p className="error">{errorMsg}</p>}

          <button type="submit" disabled={isLoggingIn}>
            Register
          </button>

          <p style="text-align: center">
            {' '}
            Already have an account? <a href="/login">Login</a>
          </p>
          <br />
          <p>
            Navigate to{' '}
            <code>
              chrome://flags/#enable-experimental-web-platform-features
            </code>{' '}
            and enable it
          </p>
        </form>
      </div>

      <style jsx>{`
        .login {
          max-width: 21rem;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 4px;
        }
        form,
        label {
          display: flex;
          flex-flow: column;
        }
        .error {
          font-size: 0.8rem;
          color: brown;
          margin-bottom: 1rem;
        }
      `}</style>
    </>
  )
}
