import { Box, CircularProgress } from '@mui/material'

export default function RouteLoading() {
    return (
        <Box
            sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
                minHeight: '100vh',
            }}
        >
            <CircularProgress aria-label="Checking session" />
        </Box>
    )
}
