# odd-preact [![NPM Version](https://img.shields.io/npm/v/@oddjs/preact.svg)](https://www.npmjs.com/package/@oddjs/preact) [![License](https://img.shields.io/npm/l/@oddjs/preact.svg)](https://github.com/oddsdk/passkeys/blob/main/license) [![odd-passkeys](https://github.com/oddsdk/passkeys/actions/workflows/odd-preact.yml/badge.svg)](https://github.com/oddsdk/passkeys/actions/workflows/odd-preact.yml)

> ODD SDK Preact hooks and context provider.

## Install

```bash
pnpm install @oddjs/preact
```

## Usage

```js
// app.jsx
import { OddContextProvider } from '@oddjs/preact'
/** @type {import('@oddjs/odd').Configuration} */
const config = {
  namespace: {
    creator: document.location.host,
    name: 'Passkey auth',
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
          <Home path="/" />
        </main>
      </OddContextProvider>
    </>
  )
}

// home.jsx
import { useOddContext } from '@oddjs/preact'

export default function Home(props) {
  const { session, isLoading, login, logout, register } = useOddContext()
}

// home.jsx with preact-router
import { useOdd } from '@oddjs/preact/router'

export default function Home(props) {
  const { session, isLoading, login, logout, register } = useOdd({
    redirectTo: '/login',
  })
}
```

## Docs

Check <https://oddsdk.github.io/passkeys/modules/_oddjs_preact.html>
