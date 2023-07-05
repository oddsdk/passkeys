/* eslint-disable unicorn/no-useless-undefined */
import * as OddPasskey from '@oddjs/passkeys'
import { OddContextProvider } from '@oddjs/preact'
import { Router } from 'preact-router'
import Home from './home.jsx'
import Login from './login.jsx'
import Register from './register.jsx'
import ReloadPrompt from './prompt.jsx'
import Test from './test.jsx'
import { ReactComponent as OddLogo } from './assets/odd-logo.svg'

/** @type {import('@oddjs/odd').Configuration} */
const config = {
  namespace: {
    creator: document.location.host,
    name: 'Passkey auth',
  },
  debug: true,
  debugging: {
    injectIntoGlobalContext: true,
  },
}

export function App() {
  return (
    <>
      <OddContextProvider
        config={config}
        componentsFactory={OddPasskey.createComponents}
      >
        <main className="App">
          <Router>
            <Home path="/" />
            <Login path="/login" />
            <Register path="/register" />
            <Test path="/test" />
          </Router>
          <div class="powered-by-odd">
            <div class="powered-by-wave">
              <img class="powered-by-bg" src="/wave-background-light.webp" width="2080" height="120" alt="Wave background"/>
              <img class="powered-by-fg" src="/wave-foreground-light.webp" width="2080" height="120" alt="Wave foreground"/>
            </div>
            <a class="powered-by-msg" href="https://odd.dev">
              Powered by <OddLogo />
            </a>
          </div>
        </main>
        <ReloadPrompt />
      </OddContextProvider>
    </>
  )
}
