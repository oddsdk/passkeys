/* eslint-disable unicorn/no-useless-undefined */
import * as OddPasskey from '@oddjs/passkeys'
import { OddContextProvider } from '@oddjs/preact'
import { Router } from 'preact-router'
import Home from './home.jsx'
import Login from './login.jsx'
import ReloadPrompt from './prompt.jsx'
import Test from './test.jsx'

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
            <Test path="/test" />
          </Router>
        </main>
        <ReloadPrompt />
      </OddContextProvider>
    </>
  )
}
