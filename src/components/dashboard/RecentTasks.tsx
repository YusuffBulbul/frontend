import { Chip, List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { RecentTask } from '../../types/dashboard'
import { formatTaskDate } from '../../utils/taskMetrics'

interface RecentTasksProps {
    tasks: RecentTask[]
}

const STATUS_LABELS = {
    TODO: 'To do',
    IN_PROGRESS: 'In progress',
    COMPLETED: 'Completed',
} as const

export default function RecentTasks({ tasks }: RecentTasksProps) {
    return (
        <Paper component="section" variant="outlined">
            <Typography sx={{ fontWeight: 750, px: 3, pt: 2.5 }} variant="h6">
                Recent tasks
            </Typography>
            <Typography color="text.secondary" sx={{ px: 3, pb: 1 }} variant="body2">
                Your five most recently created tasks.
            </Typography>
            <List disablePadding>
                {tasks.map((task) => (
                    <ListItemButton
                        component={Link}
                        key={task.id}
                        to={`/tasks?status=${task.status}`}
                    >
                        <ListItemText
                            primary={task.title}
                            secondary={`Created ${formatTaskDate(task.createdAt)}`}
                        />
                        <Chip label={STATUS_LABELS[task.status]} size="small" />
                    </ListItemButton>
                ))}
            </List>
        </Paper>
    )
}
