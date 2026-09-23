import { useEffect, useState } from 'react'
import {
    Alert,
    Box,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material'
import { getTaskErrorMessage, getTasks } from '../api/taskApi'
import CreateTaskForm from '../components/CreateTaskForm'
import TaskCard from '../components/TaskCard'
import type { TaskResponse } from '../types/task'

export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadTasks() {
            try {
                setLoading(true)
                setError(null)

                const response = await getTasks()
                setTasks(response)
            } catch (error: unknown) {
                setError(getTaskErrorMessage(error, 'Tasks could not be loaded.'))
            } finally {
                setLoading(false)
            }
        }

        void loadTasks()
    }, [])

    function handleTaskCreated(task: TaskResponse) {
        setTasks((currentTasks) => [task, ...currentTasks])
    }

    function handleTaskUpdated(updatedTask: TaskResponse) {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task,
            ),
        )
    }

    function handleTaskDeleted(taskId: string) {
        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== taskId),
        )
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4">Your Tasks</Typography>

                <Typography color="text.secondary">
                    Manage the tasks assigned to your account.
                </Typography>
            </Box>

            <CreateTaskForm onCreated={handleTaskCreated} />

            {error && <Alert severity="error">{error}</Alert>}

            {loading && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 6,
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            {!loading && !error && tasks.length === 0 && (
                <Alert severity="info">No tasks found.</Alert>
            )}

            {!loading &&
                tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onUpdated={handleTaskUpdated}
                        onDeleted={handleTaskDeleted}
                    />
                ))}
        </Stack>
    )
}
