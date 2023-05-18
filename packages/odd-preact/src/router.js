import { useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { useOddContext } from './index.js'

/**
 * Hook to access the ODD program and session from the `OddContextProvider`.
 * 
 * It uses `preact-router` to handle routing, if your are using a different router you can use the `useOddContext` hook directly.
 * 
 * It routes to the `redirectTo` path if the user is not logged in or when `redirectIfFound` is set to `true` routes to `redirectTo` if user is logged in.
 * 
 * @example
 * ```jsx
 * // login.jsx
 * import { useOdd } from '@oddjs/preact/router'
 * 
 * const { isLoading, login } = useOdd({
    redirectTo: '/',
    redirectIfFound: true,
  })
 * ```
 *
 * @example
 * ```jsx
 * // home.jsx
 * import { useOdd } from '@oddjs/preact/router'
 * 
 * const { isLoading, logout } = useOdd({
    redirectTo: '/login',
  })
 * ```
 *
 * @param {{redirectTo?: string, redirectIfFound?: boolean}} options
 */
export function useOdd({ redirectTo = '/', redirectIfFound = false }) {
  const context = useOddContext()
  if (context === undefined) {
    throw new Error(`useOddContext must be used within a OddContextProvider.`)
  }
  const { isLoading, session } = context

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if session not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || isLoading) return

    if (
      // If redirectTo is set, redirect if the session was not found.
      (redirectTo && !redirectIfFound && !session) ||
      // If redirectIfFound is also set, redirect if the session was found
      (redirectIfFound && session)
    ) {
      route(redirectTo, true)
    }
  }, [redirectIfFound, redirectTo, isLoading, session])

  return context
}
