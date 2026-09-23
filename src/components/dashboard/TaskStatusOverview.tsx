import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material'
import type { TaskStatusMetric } from '../../types/dashboard'

interface TaskStatusOverviewProps {
    statusMetrics: TaskStatusMetric[]
}

const STATUS_COLORS = {
    TODO: 'primary',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
} as const

const STATUS_HEX_COLORS = {
    TODO: '#1976d2',
    IN_PROGRESS: '#ed6c02',
    COMPLETED: '#2e7d32',
} as const

export default function TaskStatusOverview({
    statusMetrics,
}: TaskStatusOverviewProps) {
    const total = statusMetrics.reduce((sum, metric) => sum + metric.count, 0)
    let segmentStart = 0
    const segments = statusMetrics.map((metric) => {
        const end = segmentStart + metric.percentage
        const segment = `${STATUS_HEX_COLORS[metric.status]} ${segmentStart}% ${end}%`
        segmentStart = end
        return segment
    })

    return (
        <Card component="section">
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography sx={{ fontWeight: 750 }} variant="h6">
                    Status distribution
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }} variant="body2">
                    A clear view of where your work stands.
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
                    Status distribution: {statusMetrics.map((metric) => `${metric.label} ${metric.count} (${metric.percentage}%)`).join(', ')}.
                </Typography>
                <Box
                    aria-label={`Task status chart for ${total} tasks`}
                    role="img"
                    sx={{
                        alignItems: 'center',
                        background: total > 0 ? `conic-gradient(${segments.join(', ')})` : '#e0e0e0',
                        borderRadius: '50%',
                        display: 'flex',
                        height: 128,
                        justifyContent: 'center',
                        mb: 3,
                        mx: 'auto',
                        position: 'relative',
                        width: 128,
                        '&::after': {
                            backgroundColor: 'background.paper',
                            borderRadius: '50%',
                            content: '""',
                            inset: 12,
                            position: 'absolute',
                        },
                    }}
                >
                    <Typography sx={{ fontWeight: 800, position: 'relative', zIndex: 1 }} variant="h6">
                        {total}
                    </Typography>
                </Box>
                <Stack spacing={2.25}>
                    {statusMetrics.map((metric) => (
                        <Box key={metric.status}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                <Typography variant="body2">{metric.label}</Typography>
                                <Typography color="text.secondary" variant="body2">
                                    {metric.count} tasks · {metric.percentage}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                aria-label={`${metric.label}: ${metric.count} tasks, ${metric.percentage} percent`}
                                color={STATUS_COLORS[metric.status]}
                                sx={{ borderRadius: 1, height: 8 }}
                                value={metric.percentage}
                                variant="determinate"
                            />
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    )
}
