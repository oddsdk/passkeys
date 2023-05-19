import type {
  Session,
  Program,
  Configuration,
  Components,
  ProgramError,
} from '@oddjs/odd'

export type LoginFn = (username?: string) => Promise<Session | undefined>
export type LogoutFn = () => Promise<void>

export type OddContext =
  | {
      isLoading: true
      error: undefined
      session: null
      program: undefined
      login: LoginFn
      register: LoginFn
      logout: LogoutFn
    }
  | {
      isLoading: false
      error: ProgramError
      session: null
      program: undefined
      login: LoginFn
      register: LoginFn
      logout: LogoutFn
    }
  | {
      isLoading: false
      error: undefined
      session: Session | null
      program: Program
      login: LoginFn
      register: LoginFn
      logout: LogoutFn
    }
  | {
      isLoading: false
      error: undefined
      session: Session | null
      program: Program
      login: LoginFn
      register: LoginFn
      logout: LogoutFn
    }

export interface OddContextProviderProps {
  config: Configuration
  components?: Partial<Components>
  componentsFactory?: (config: Configuration) => Promise<Partial<Components>>
}
