import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import AccessDeniedPage from '../pages/AccessDeniedPage'
import RouteLoading from './RouteLoading'
import { hasAdminRole } from '../utils/authRoles'

export default function RoleProtectedRoute() {
    const { isAuthenticated, isInitializing, user } = useAuth()
    const location = useLocation()

    if (isInitializing) return <RouteLoading />

    if (!isAuthenticated) {
        return (
            <Navigate
                replace
                to="/login"
                state={{ from: `${location.pathname}${location.search}` }}
            />
        )
    }

    if (!hasAdminRole(user)) return <AccessDeniedPage />

    return <Outlet />
}
