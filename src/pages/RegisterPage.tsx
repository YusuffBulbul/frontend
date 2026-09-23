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
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
    const { error: authError, isLoading, register } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [formError, setFormError] = useState<string | null>(null)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const normalizedName = name.trim()
        if (normalizedName.length < 2 || normalizedName.length > 100) {
            setFormError('Name must be between 2 and 100 characters.')
            return
        }
        if (!EMAIL_PATTERN.test(email.trim())) {
            setFormError('Enter a valid email address.')
            return
        }
        if (password.length < 8 || password.length > 72) {
            setFormError('Password must be between 8 and 72 characters.')
            return
        }
        if (password !== confirmPassword) {
            setFormError('Passwords do not match.')
            return
        }

        setFormError(null)
        try {
            await register({ name: normalizedName, email: email.trim(), password })
            navigate('/dashboard', { replace: true })
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
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', maxWidth: 460, width: '100%' }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography color="primary" sx={{ fontWeight: 800 }} variant="overline">
                                TaskFlow
                            </Typography>
                            <Typography sx={{ fontWeight: 800 }} variant="h4">
                                Create your account
                            </Typography>
                            <Typography color="text.secondary">
                                Start organizing work in your own workspace.
                            </Typography>
                        </Box>
                        {formError && <Alert severity="error">{formError}</Alert>}
                        {authError && <Alert severity="error">{authError.message}</Alert>}
                        <Box component="form" noValidate onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    autoComplete="name"
                                    autoFocus
                                    error={Boolean(authError?.fieldErrors?.name)}
                                    fullWidth
                                    helperText={authError?.fieldErrors?.name}
                                    label="Name"
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                    value={name}
                                />
                                <TextField
                                    autoComplete="email"
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
                                    autoComplete="new-password"
                                    error={Boolean(authError?.fieldErrors?.password)}
                                    fullWidth
                                    helperText={authError?.fieldErrors?.password}
                                    label="Password"
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    type="password"
                                    value={password}
                                />
                                <TextField
                                    autoComplete="new-password"
                                    fullWidth
                                    label="Confirm password"
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                    type="password"
                                    value={confirmPassword}
                                />
                                <Button disabled={isLoading} size="large" type="submit" variant="contained">
                                    {isLoading ? 'Creating account...' : 'Create account'}
                                </Button>
                            </Stack>
                        </Box>
                        <Typography align="center" color="text.secondary" variant="body2">
                            Already have an account?{' '}
                            <Link component={RouterLink} to="/login">
                                Sign in
                            </Link>
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    )
}
