import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import AnalyticsPage from './pages/AnalyticsPage'
import TasksPage from './pages/TasksPage'

export default function App() {
  return (
      <BrowserRouter>
        <CssBaseline />

        <AppBar position="static">
          <Toolbar>
            <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                }}
            >
              Task Management System
            </Typography>

            <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                }}
            >
              <Button
                  color="inherit"
                  component={Link}
                  to="/tasks"
              >
                Tasks
              </Button>

              <Button
                  color="inherit"
                  component={Link}
                  to="/analytics"
              >
                Analytics
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container
            maxWidth="lg"
            sx={{
              py: 4,
            }}
        >
          <Routes>
            <Route path="/tasks" element={<TasksPage />} />

            <Route
                path="/analytics"
                element={<AnalyticsPage />}
            />

            <Route
                path="/"
                element={<Navigate to="/tasks" replace />}
            />

            <Route
                path="*"
                element={<Navigate to="/tasks" replace />}
            />
          </Routes>
        </Container>
      </BrowserRouter>
  )
}