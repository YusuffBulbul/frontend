import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined'
import { Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function DashboardEmptyState() {
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
                    <Button component={Link} to="/tasks" variant="contained">
                        Create a task
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    )
}
