import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined'
import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

interface KanbanEmptyStateProps {
    title?: string
    message?: string
    showCreateAction?: boolean
}

export default function KanbanEmptyState({
    title = 'No tasks yet',
    message = 'Create a task to start organizing your work.',
    showCreateAction = false,
}: KanbanEmptyStateProps) {
    return (
        <Stack spacing={1} sx={{ alignItems: 'center', p: 3, textAlign: 'center' }}>
            <AddTaskOutlinedIcon aria-hidden="true" color="disabled" />
            <Typography sx={{ fontWeight: 700 }} variant="body1">
                {title}
            </Typography>
            <Typography color="text.secondary" variant="body2">
                {message}
            </Typography>
            {showCreateAction && (
                <Button component={Link} size="small" to="/tasks" variant="outlined">
                    Create a task
                </Button>
            )}
        </Stack>
    )
}
