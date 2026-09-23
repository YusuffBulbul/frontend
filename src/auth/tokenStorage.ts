import type {
    AuthenticatedUser,
    StoredAuthSession,
} from '../types/auth'

const SESSION_KEY = 'task-management.auth.session'
const EXPIRATION_SAFETY_WINDOW_MS = 30_000

let inMemorySession: StoredAuthSession | null = null

function getStorage(): Storage | null {
    try {
        return window.sessionStorage
    } catch {
        return null
    }
}

function isUser(value: unknown): value is AuthenticatedUser {
    if (typeof value !== 'object' || value === null) return false
    const user = value as Record<string, unknown>
    return (
        typeof user.userId === 'string' &&
        typeof user.name === 'string' &&
        typeof user.email === 'string' &&
        Array.isArray(user.roles) &&
        user.roles.every((role) => typeof role === 'string')
    )
}

function isSession(value: unknown): value is StoredAuthSession {
    if (typeof value !== 'object' || value === null) return false
    const session = value as Record<string, unknown>
    return (
        typeof session.accessToken === 'string' &&
        session.accessToken.length > 0 &&
        typeof session.tokenType === 'string' &&
        typeof session.expiresIn === 'number' &&
        Number.isFinite(session.expiresIn) &&
        typeof session.expiresAt === 'number' &&
        Number.isFinite(session.expiresAt) &&
        isUser(session.user)
    )
}

function isExpired(session: StoredAuthSession): boolean {
    return session.expiresAt <= Date.now()
}

export function readSession(): StoredAuthSession | null {
    const currentStorage = getStorage()
    if (!currentStorage) {
        return inMemorySession && !isExpired(inMemorySession)
            ? inMemorySession
            : null
    }

    try {
        const rawSession = currentStorage.getItem(SESSION_KEY)
        if (!rawSession) return null

        const session: unknown = JSON.parse(rawSession)
        if (!isSession(session) || isExpired(session)) {
            clearSession()
            return null
        }

        inMemorySession = session
        return session
    } catch {
        clearSession()
        return null
    }
}

export function writeSession(input: {
    accessToken: string
    tokenType: string
    expiresIn: number
    user: AuthenticatedUser
}): StoredAuthSession {
    const expiresAt =
        Date.now() + input.expiresIn * 1000 - EXPIRATION_SAFETY_WINDOW_MS

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        throw new Error('Authentication session has already expired.')
    }

    const session: StoredAuthSession = {
        ...input,
        expiresAt,
    }
    inMemorySession = session

    const currentStorage = getStorage()
    if (currentStorage) {
        try {
            currentStorage.setItem(SESSION_KEY, JSON.stringify(session))
        } catch {
            // The in-memory session remains usable when browser storage is unavailable.
        }
    }

    return session
}

export function getAccessToken(): string | null {
    return readSession()?.accessToken ?? null
}

export function clearSession(): void {
    inMemorySession = null
    const currentStorage = getStorage()
    if (!currentStorage) return

    try {
        currentStorage.removeItem(SESSION_KEY)
    } catch {
        // Clearing browser storage is best-effort and must not crash the application.
    }
}
