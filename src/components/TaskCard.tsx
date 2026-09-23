import { useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    MenuItem,
    Select,
    Stack,
    Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { deleteTask, getTaskErrorMessage, updateTask } from '../api/taskApi'
import type { TaskResponse, TaskStatus } from '../types/task'

interface TaskCardProps {
    task: TaskResponse
    onUpdated: (task: TaskResponse) => void
    onDeleted: (taskId: string) => void
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
                                     onUpdated,
                                     onDeleted,
                                 }: TaskCardProps) {
    const [status, setStatus] = useState<TaskStatus>(task.status)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function handleStatusChange(event: SelectChangeEvent) {
        setStatus(event.target.value as TaskStatus)
    }

    async function handleUpdate() {
        if (submitting) {
            return
        }

        try {
            setSubmitting(true)
            setError(null)

            const updatedTask = await updateTask(task.id, {
                title: task.title,
                description: task.description,
                status,
            })

            onUpdated(updatedTask)
        } catch (error: unknown) {
            setError(getTaskErrorMessage(error, 'Task could not be updated.'))
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete() {
        if (submitting) {
            return
        }

        const confirmed = window.confirm(
            `Do you want to delete "${task.title}"?`,
        )

        if (!confirmed) {
            return
        }

        try {
            setSubmitting(true)
            setError(null)

            await deleteTask(task.id)
            onDeleted(task.id)
        } catch (error: unknown) {
            setError(getTaskErrorMessage(error, 'Task could not be deleted.'))
        } finally {
            setSubmitting(false)
        }
    }

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

                    {error && <Alert severity="error">{error}</Alert>}

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Select
                            size="small"
                            value={status}
                            onChange={handleStatusChange}
                            disabled={submitting}
                            sx={{ minWidth: 180 }}
                        >
                            <MenuItem value="TODO">TO DO</MenuItem>
                            <MenuItem value="IN_PROGRESS">IN PROGRESS</MenuItem>
                            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                        </Select>

                        <Button
                            variant="contained"
                            onClick={handleUpdate}
                            disabled={submitting || status === task.status}
                        >
                            UPDATE
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDelete}
                            disabled={submitting}
                        >
                            DELETE
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    )
}
