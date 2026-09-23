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

export default function TaskStatusOverview({
    statusMetrics,
}: TaskStatusOverviewProps) {
    return (
        <Card component="section">
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography sx={{ fontWeight: 750 }} variant="h6">
                    Status distribution
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }} variant="body2">
                    A clear view of where your work stands.
                </Typography>
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
