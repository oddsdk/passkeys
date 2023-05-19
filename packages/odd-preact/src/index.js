/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/no-useless-undefined */
import { createContext, createElement } from 'preact'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'preact/hooks'
import * as odd from '@oddjs/odd'

/** @type {import('preact').Context<import('./types.js').OddContext>} */
// @ts-ignore - TODO fix this
const OddContext = createContext({
  isLoading: true,
  error: undefined,
  session: null,
  program: undefined,
  login: undefined,
  logout: undefined,
  register: undefined,
})
/**
 *
 * @param {import('./types.js').OddContextProviderProps & {children : import('preact').ComponentChildren}} props
 * @returns
 */
export function OddContextProvider({
  components,
  componentsFactory,
  config,
  children,
}) {
  // State
  const [error, setError] = useState(
    /** @type {odd.ProgramError |undefined} */ (undefined)
  )
  const [program, setProgram] = useState(
    /** @type {odd.Program | undefined} */ (undefined)
  )
  const [session, setSession] = useState(
    /** @type {import('@oddjs/odd').Session | null} */ (null)
  )

  // Effects
  useEffect(() => {
    let mounted = true

    async function setup() {
      if (mounted) {
        try {
          let comps
          if (components) {
            comps = components
          }
          if (componentsFactory) {
            comps = await componentsFactory(config)
          }
          const program = await odd.program({
            ...config,
            ...comps,
          })
          setProgram(program)
          setSession(program.session)
        } catch (error) {
          setError(/** @type {odd.ProgramError} */ (error))
        }
      }
    }

    setup()

    return () => {
      mounted = false
    }
  }, [components, componentsFactory, config])

  const login = useCallback(
    async (/** @type {string | undefined} */ username) => {
      if (!program) {
        throw new Error('Needs program.')
      }
      // @ts-ignore
      await program.auth.register({ username })
      const session = await program.auth.session()
      if (session) {
        setSession(session)
        return session
      }
    },
    [program]
  )

  const logout = useCallback(
    async (/** @type {string | undefined} */ username) => {
      if (!program) {
        throw new Error('Needs program.')
      }
      if (session) {
        await session.destroy()
        setSession(null)
      }
    },
    [program, session]
  )

  /** @type {import('./types.js').OddContext} */
  const value = useMemo(() => {
    if (!program) {
      return {
        isLoading: true,
        error: undefined,
        session: null,
        program: undefined,
        register: login,
        login,
        logout,
      }
    }

    if (error) {
      return {
        isLoading: false,
        error,
        session: null,
        program: undefined,
        register: login,
        login,
        logout,
      }
    }
    if (program) {
      return {
        isLoading: false,
        error,
        session,
        program,
        register: login,
        login,
        logout,
      }
    }

    return {
      isLoading: false,
      error: undefined,
      session,
      program,
      register: login,
      login,
      logout,
    }
  }, [program, error, session, login, logout])

  return createElement(OddContext.Provider, { value, children })
}

/**
 * Hook to access the ODD program and session from the `OddContextProvider`.
 * 
 * @example
 * ```jsx
 * // home.jsx
 * import { useOddContext } from '@oddjs/preact'
 *
export default function Home(props) {
  const { session, isLoading, login, logout, register } = useOddContext()
}
 * ```
 */
export function useOddContext() {
  const context = useContext(OddContext)
  if (context === undefined) {
    throw new Error(`useOddContext must be used within a OddContextProvider.`)
  }

  return context
}
