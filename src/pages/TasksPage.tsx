import { useEffect, useState } from 'react'
import {
    Alert,
    Box,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material'
import { getTasks } from '../api/taskApi'
import CreateTaskForm from '../components/CreateTaskForm'
import TaskCard from '../components/TaskCard'
import type { Task } from '../types/task'

const USER_ID = 'user-1'

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadTasks() {
            try {
                setLoading(true)
                setError(null)

                const response = await getTasks(USER_ID)
                setTasks(response)
            } catch {
                setError('Tasks could not be loaded.')
            } finally {
                setLoading(false)
            }
        }

        void loadTasks()
    }, [])

    function handleTaskCreated(task: Task) {
        setTasks((currentTasks) => [task, ...currentTasks])
    }

    function handleTaskUpdated(updatedTask: Task) {
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
                <Typography variant="h4">Task Management</Typography>

                <Typography color="text.secondary">
                    User: {USER_ID}
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