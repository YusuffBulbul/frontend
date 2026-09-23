import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function AccessDeniedPage() {
    return (
        <Stack
            spacing={2}
            sx={{
                alignItems: 'center',
                py: 8,
                textAlign: 'center',
            }}
        >
            <Typography component="h1" variant="h4">
                Access denied
            </Typography>
            <Typography color="text.secondary">
                You do not have permission to view Analytics.
            </Typography>
            <Button component={Link} to="/dashboard" variant="contained">
                Back to dashboard
            </Button>
        </Stack>
    )
}
