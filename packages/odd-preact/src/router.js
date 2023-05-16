import { useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { useOddContext } from './index.jsx'

export function useOdd({ redirectTo = '', redirectIfFound = false } = {}) {
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
