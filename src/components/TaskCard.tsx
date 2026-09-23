import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from '@mui/material'
import type { TaskResponse, TaskStatus } from '../types/task'

interface TaskCardProps {
    task: TaskResponse
    onEdit: (task: TaskResponse) => void
    onDelete: (task: TaskResponse) => void
    isDeleting: boolean
}

const STATUS_LABELS: Record<TaskStatus, string> = {
    TODO: 'TO DO',
    IN_PROGRESS: 'IN PROGRESS',
    COMPLETED: 'COMPLETED',
}

const STATUS_COLORS: Record<
    TaskStatus,
    'default' | 'warning' | 'success'
> = {
    TODO: 'default',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
}

export default function TaskCard({
                                     task,
                                     onEdit,
                                     onDelete,
                                     isDeleting,
                                 }: TaskCardProps) {
    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Typography variant="h6">{task.title}</Typography>

                        <Chip
                            label={STATUS_LABELS[task.status]}
                            color={STATUS_COLORS[task.status]}
                            size="small"
                        />
                    </Box>

                    <Typography color="text.secondary">
                        {task.description}
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={() => onEdit(task)}
                            disabled={isDeleting}
                        >
                            EDIT
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => onDelete(task)}
                            disabled={isDeleting}
                        >
                            DELETE
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    )
}
