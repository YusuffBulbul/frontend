const DEFAULT_AUTHENTICATED_PATH = '/dashboard'
const PROTECTED_PATHS = ['/dashboard', '/kanban', '/tasks', '/analytics']

export interface AuthRedirectState {
    from?: string
    message?: string
}

function isProtectedPath(value: string): boolean {
    return PROTECTED_PATHS.some(
        (path) => value === path || value.startsWith(`${path}?`),
    )
}

export function getPostAuthenticationPath(state: unknown): string {
    if (typeof state !== 'object' || state === null) {
        return DEFAULT_AUTHENTICATED_PATH
    }

    const from = (state as AuthRedirectState).from
    return typeof from === 'string' && isProtectedPath(from)
        ? from
        : DEFAULT_AUTHENTICATED_PATH
}

export function getRouteMessage(state: unknown): string | null {
    if (typeof state !== 'object' || state === null) return null
    const message = (state as AuthRedirectState).message
    return typeof message === 'string' && message.length <= 200
        ? message
        : null
}
