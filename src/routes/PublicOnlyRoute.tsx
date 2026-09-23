import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import RouteLoading from './RouteLoading'

export default function PublicOnlyRoute() {
    const { isAuthenticated, isInitializing } = useAuth()

    if (isInitializing) return <RouteLoading />
    return isAuthenticated ? <Navigate replace to="/dashboard" /> : <Outlet />
}
