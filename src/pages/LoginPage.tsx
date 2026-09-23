import { useState } from 'react'
import type { FormEvent } from 'react'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Link,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getPostAuthenticationPath, getRouteMessage } from '../routes/authNavigation'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
    const { error: authError, isLoading, login } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [formError, setFormError] = useState<string | null>(null)
    const routeMessage = getRouteMessage(location.state)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!EMAIL_PATTERN.test(email.trim())) {
            setFormError('Enter a valid email address.')
            return
        }
        if (!password) {
            setFormError('Password is required.')
            return
        }

        setFormError(null)
        try {
            await login({ email: email.trim(), password })
            navigate(getPostAuthenticationPath(location.state), { replace: true })
        } catch {
            // AuthContext exposes a safe, backend-derived error state for the form.
        }
    }

    return (
        <Box
            sx={{
                alignItems: 'center',
                backgroundColor: '#f5f7fb',
                display: 'flex',
                justifyContent: 'center',
                minHeight: '100vh',
                p: 2,
            }}
        >
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', maxWidth: 440, width: '100%' }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography color="primary" sx={{ fontWeight: 800 }} variant="overline">
                                TaskFlow
                            </Typography>
                            <Typography sx={{ fontWeight: 800 }} variant="h4">
                                Welcome back
                            </Typography>
                            <Typography color="text.secondary">
                                Sign in to continue to your workspace.
                            </Typography>
                        </Box>
                        {routeMessage && <Alert severity="info">{routeMessage}</Alert>}
                        {formError && <Alert severity="error">{formError}</Alert>}
                        {authError && <Alert severity="error">{authError.message}</Alert>}
                        <Box component="form" noValidate onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    autoComplete="email"
                                    autoFocus
                                    error={Boolean(authError?.fieldErrors?.email)}
                                    fullWidth
                                    helperText={authError?.fieldErrors?.email}
                                    label="Email"
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                    type="email"
                                    value={email}
                                />
                                <TextField
                                    autoComplete="current-password"
                                    error={Boolean(authError?.fieldErrors?.password)}
                                    fullWidth
                                    helperText={authError?.fieldErrors?.password}
                                    label="Password"
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    type="password"
                                    value={password}
                                />
                                <Button disabled={isLoading} size="large" type="submit" variant="contained">
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </Stack>
                        </Box>
                        <Typography align="center" color="text.secondary" variant="body2">
                            New to TaskFlow?{' '}
                            <Link component={RouterLink} to="/register">
                                Create an account
                            </Link>
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    )
}
