import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import RouteLoading from './RouteLoading'

export default function ProtectedRoute() {
    const { error, isAuthenticated, isInitializing } = useAuth()
    const location = useLocation()

    if (isInitializing) return <RouteLoading />

    if (!isAuthenticated) {
        return (
            <Navigate
                replace
                to="/login"
                state={{
                    from: `${location.pathname}${location.search}`,
                    ...(error ? { message: error.message } : {}),
                }}
            />
        )
    }

    return <Outlet />
}
