import type { AuthenticatedUser } from '../types/auth'

/**
 * Client-side role checks are for navigation and UX only. The API Gateway
 * remains the authoritative authorization boundary.
 */
export function hasAdminRole(user: AuthenticatedUser | null | undefined): boolean {
    return Array.isArray(user?.roles) && user.roles.includes('ADMIN')
}
