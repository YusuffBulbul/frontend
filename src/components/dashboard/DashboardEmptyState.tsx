import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined'
import { Button, Card, CardContent, Stack, Typography } from '@mui/material'

interface DashboardEmptyStateProps {
    onCreateTask: () => void
}

export default function DashboardEmptyState({ onCreateTask }: DashboardEmptyStateProps) {
    return (
        <Card component="section" variant="outlined">
            <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                    <AddTaskOutlinedIcon aria-hidden="true" color="primary" fontSize="large" />
                    <Typography sx={{ fontWeight: 750 }} variant="h6">
                        Start with your first task
                    </Typography>
                    <Typography color="text.secondary">
                        Add a task to begin tracking your personal work here.
                    </Typography>
                    <Button onClick={onCreateTask} variant="contained">
                        Create a task
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    )
}
