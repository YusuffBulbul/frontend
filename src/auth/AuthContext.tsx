import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import type { ReactNode } from 'react'
import { login as loginRequest, register as registerRequest } from '../api/authApi'
import type {
    AuthError,
    AuthResponse,
    AuthenticatedUser,
    LoginRequest,
    RegisterRequest,
    StoredAuthSession,
} from '../types/auth'
import {
    notifySessionExpired,
    resetSessionExpiredNotification,
    subscribeToSessionExpired,
} from './authEvents'
import { clearSession, readSession, writeSession } from './tokenStorage'

interface AuthContextValue {
    user: AuthenticatedUser | null
    accessToken: string | null
    isAuthenticated: boolean
    isInitializing: boolean
    isLoading: boolean
    error: AuthError | null
    login: (request: LoginRequest) => Promise<void>
    register: (request: RegisterRequest) => Promise<void>
    logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toSession(response: AuthResponse): StoredAuthSession {
    return writeSession({
        accessToken: response.accessToken,
        tokenType: response.tokenType,
        expiresIn: response.expiresIn,
        user: {
            userId: response.userId,
            name: response.name,
            email: response.email,
            roles: response.roles,
        },
    })
}

function toSafeError(error: unknown, fallback: string): AuthError {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const authError = error as AuthError
        if (typeof authError.message === 'string') {
            return {
                message: authError.message,
                ...(authError.fieldErrors ? { fieldErrors: authError.fieldErrors } : {}),
            }
        }
    }
    return { message: fallback }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<StoredAuthSession | null>(() =>
        readSession(),
    )
    const isInitializing = false
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<AuthError | null>(null)

    const logout = useCallback(() => {
        clearSession()
        setSession(null)
        setError(null)
    }, [])

    const handleSessionExpired = useCallback(() => {
        clearSession()
        setSession(null)
        setError({ message: 'Your session has expired. Please sign in again.' })
    }, [])

    useEffect(() => {
        return subscribeToSessionExpired(handleSessionExpired)
    }, [handleSessionExpired])

    useEffect(() => {
        if (!session) return

        const remaining = Math.max(0, session.expiresAt - Date.now())
        const timeout = window.setTimeout(() => {
            clearSession()
            notifySessionExpired()
        }, remaining)

        return () => window.clearTimeout(timeout)
    }, [session])

    const completeAuthentication = useCallback((response: AuthResponse) => {
        const nextSession = toSession(response)
        resetSessionExpiredNotification()
        setSession(nextSession)
    }, [])

    const login = useCallback(
        async (request: LoginRequest) => {
            setIsLoading(true)
            setError(null)
            try {
                completeAuthentication(await loginRequest(request))
            } catch (requestError) {
                const safeError = toSafeError(requestError, 'Login failed.')
                setError(safeError)
                throw safeError
            } finally {
                setIsLoading(false)
            }
        },
        [completeAuthentication],
    )

    const register = useCallback(
        async (request: RegisterRequest) => {
            setIsLoading(true)
            setError(null)
            try {
                // Auth Service returns AuthResponse for register, so registration creates a session.
                completeAuthentication(await registerRequest(request))
            } catch (requestError) {
                const safeError = toSafeError(requestError, 'Registration failed.')
                setError(safeError)
                throw safeError
            } finally {
                setIsLoading(false)
            }
        },
        [completeAuthentication],
    )

    const value = useMemo<AuthContextValue>(
        () => ({
            user: session?.user ?? null,
            accessToken: session?.accessToken ?? null,
            isAuthenticated: session !== null,
            isInitializing,
            isLoading,
            error,
            login,
            register,
            logout,
        }),
        [error, isInitializing, isLoading, login, logout, register, session],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
