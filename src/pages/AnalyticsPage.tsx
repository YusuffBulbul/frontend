import { useEffect, useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material'
import { getAnalyticsError, getAnalyticsSummary } from '../api/analyticsApi'
import type {
    AnalyticsRequestError,
    AnalyticsSummary,
} from '../types/analytics'

export default function AnalyticsPage() {
    const [summary, setSummary] =
        useState<AnalyticsSummary | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<AnalyticsRequestError | null>(null)
    const [requestVersion, setRequestVersion] = useState(0)

    useEffect(() => {
        const controller = new AbortController()
        let isActive = true

        async function loadSummary() {
            try {
                setLoading(true)
                setError(null)

                const response = await getAnalyticsSummary({ signal: controller.signal })
                if (isActive) setSummary(response)
            } catch (requestError: unknown) {
                if (isActive && !controller.signal.aborted) {
                    setError(getAnalyticsError(requestError))
                }
            } finally {
                if (isActive) setLoading(false)
            }
        }

        void loadSummary()

        return () => {
            isActive = false
            controller.abort()
        }
    }, [requestVersion])

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 6,
                }}
            >
                <CircularProgress />
            </Box>
        )
    }

    const statistics = [
        {
            label: 'Total Tasks',
            value: summary?.totalTasks ?? 0,
        },
        {
            label: 'Active Tasks',
            value: summary?.activeTasks ?? 0,
        },
        {
            label: 'Deleted Tasks',
            value: summary?.deletedTasks ?? 0,
        },
        {
            label: 'To Do',
            value: summary?.todoTasks ?? 0,
        },
        {
            label: 'In Progress',
            value: summary?.inProgressTasks ?? 0,
        },
        {
            label: 'Completed',
            value: summary?.completedTasks ?? 0,
        },
        {
            label: 'Total Notifications',
            value: summary?.totalNotifications ?? 0,
        },
    ]

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4">
                    Analytics Dashboard
                </Typography>

                <Typography color="text.secondary">
                    Task and notification statistics
                </Typography>
            </Box>

            {error && (
                <Alert
                    action={error.kind === 'request' ? <Button color="inherit" onClick={() => setRequestVersion((version) => version + 1)} size="small">Retry</Button> : undefined}
                    severity="error"
                >
                    {error.message}
                </Alert>
            )}

            {!error && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                        },
                        gap: 2,
                    }}
                >
                    {statistics.map((statistic) => (
                        <Card key={statistic.label}>
                            <CardContent>
                                <Typography color="text.secondary">
                                    {statistic.label}
                                </Typography>

                                <Typography variant="h3">
                                    {statistic.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Stack>
    )
}
