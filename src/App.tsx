import { CssBaseline } from '@mui/material'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { useAuth } from './auth/useAuth'
import AppShell from './layout/AppShell'
import AnalyticsPage from './pages/AnalyticsPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import KanbanPage from './pages/KanbanPage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'
import RouteLoading from './routes/RouteLoading'
import RoleProtectedRoute from './routes/RoleProtectedRoute'

function HomeRedirect() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) return <RouteLoading />
  return <Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />
}

export default function App() {
  return (
      <BrowserRouter>
        <CssBaseline />
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/kanban" element={<KanbanPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route element={<RoleProtectedRoute />}>
                  <Route path="/analytics" element={<AnalyticsPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
      </BrowserRouter>
  )
}
