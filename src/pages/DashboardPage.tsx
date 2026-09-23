import { useEffect, useMemo, useRef, useState } from 'react'
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    LinearProgress,
    Skeleton,
    Snackbar,
    Stack,
    Typography,
} from '@mui/material'
import { Link } from 'react-router-dom'
import { getTaskErrorMessage, getTasks } from '../api/taskApi'
import { useAuth } from '../auth/useAuth'
import DashboardEmptyState from '../components/dashboard/DashboardEmptyState'
import DashboardSummaryCard from '../components/dashboard/DashboardSummaryCard'
import RecentTasks from '../components/dashboard/RecentTasks'
import TaskFormDialog from '../components/TaskFormDialog'
import TaskStatusOverview from '../components/dashboard/TaskStatusOverview'
import type { TaskResponse } from '../types/task'
import {
    getRecentTasks,
    getTaskMetrics,
    getTaskStatusMetrics,
} from '../utils/taskMetrics'

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
}

function DashboardLoading() {
    return (
        <Stack spacing={3}>
            <Skeleton height={160} variant="rounded" />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
                {[0, 1, 2, 3].map((item) => (
                    <Skeleton height={116} key={item} variant="rounded" />
                ))}
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1.2fr)' } }}>
                <Skeleton height={260} variant="rounded" />
                <Skeleton height={260} variant="rounded" />
            </Box>
        </Stack>
    )
}

export default function DashboardPage() {
    const { user } = useAuth()
    const [tasks, setTasks] = useState<TaskResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [requestVersion, setRequestVersion] = useState(0)
    const [createOpen, setCreateOpen] = useState(false)
    const [notification, setNotification] = useState<{
        key: number
        message: string
        severity: 'success' | 'error'
    } | null>(null)
    const notificationKeyRef = useRef(0)

    useEffect(() => {
        const controller = new AbortController()
        let isActive = true

        async function loadDashboard() {
            try {
                setIsLoading(true)
                setError(null)
                const response = await getTasks({ signal: controller.signal })
                if (isActive) {
                    setTasks(response)
                }
            } catch (requestError: unknown) {
                if (isActive && !controller.signal.aborted) {
                    setError(
                        getTaskErrorMessage(
                            requestError,
                            'Your dashboard could not be loaded. Please try again.',
                        ),
                    )
                }
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        void loadDashboard()

        return () => {
            isActive = false
            controller.abort()
        }
    }, [requestVersion])

    const metrics = useMemo(() => getTaskMetrics(tasks), [tasks])
    const statusMetrics = useMemo(() => getTaskStatusMetrics(metrics), [metrics])
    const recentTasks = useMemo(() => getRecentTasks(tasks), [tasks])
    const userName = user?.name.trim() || 'there'

    function showNotification(message: string, severity: 'success' | 'error') {
        notificationKeyRef.current += 1
        setNotification({ key: notificationKeyRef.current, message, severity })
    }

    function handleCreated(task: TaskResponse) {
        setTasks((currentTasks) => [task, ...currentTasks])
        setCreateOpen(false)
        showNotification('Task created successfully.', 'success')
    }

    if (isLoading) {
        return <DashboardLoading />
    }

    return (
        <Stack spacing={3}>
            <Card
                component="section"
                sx={{
                    background: 'linear-gradient(135deg, #f0f5ff 0%, #ffffff 60%)',
                    border: '1px solid',
                    borderColor: 'primary.light',
                }}
            >
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                    <Box sx={{ alignItems: { md: 'center' }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'space-between' }}>
                        <Box>
                            <Typography color="primary" sx={{ fontWeight: 750 }} variant="overline">
                                Personal workspace
                            </Typography>
                            <Typography sx={{ fontWeight: 800 }} variant="h4">
                                {getGreeting()}, {userName}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                                {error
                                    ? 'We could not retrieve your task summary. Please try again.'
                                    : metrics.total === 0
                                      ? 'Your workspace is ready for its first task.'
                                      : `You have ${metrics.inProgress} task${metrics.inProgress === 1 ? '' : 's'} in progress and have completed ${metrics.completed}.`}
                            </Typography>
                            {user?.email && (
                                <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                                    {user.email}
                                </Typography>
                            )}
                        </Box>
                        <Stack spacing={1.25} sx={{ alignItems: { xs: 'stretch', sm: 'flex-start' } }}>
                            <Button component={Link} to="/tasks" variant="contained">
                                Go to my tasks
                            </Button>
                            <Button onClick={() => setCreateOpen(true)} startIcon={<AddTaskOutlinedIcon />} variant="outlined">
                                Create a task
                            </Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>

            {error && (
                <Alert
                    action={
                        <Button color="inherit" onClick={() => setRequestVersion((version) => version + 1)} size="small">
                            Retry
                        </Button>
                    }
                    severity="error"
                >
                    {error}
                </Alert>
            )}

            {!error && (
                <>
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
                        <DashboardSummaryCard accent="#e8f0fe" icon={<AssignmentOutlinedIcon color="primary" />} label="Total tasks" to="/tasks" value={metrics.total} />
                        <DashboardSummaryCard accent="#eef4ff" icon={<PendingActionsOutlinedIcon color="primary" />} label="To do" to="/tasks?status=TODO" value={metrics.todo} />
                        <DashboardSummaryCard accent="#fff4e5" icon={<PendingActionsOutlinedIcon color="warning" />} label="In progress" to="/tasks?status=IN_PROGRESS" value={metrics.inProgress} />
                        <DashboardSummaryCard accent="#edf7ed" icon={<CheckCircleOutlinedIcon color="success" />} label="Completed" to="/tasks?status=COMPLETED" value={metrics.completed} />
                    </Box>

                    <Card component={Link} to="/kanban" sx={{ color: 'inherit', textDecoration: 'none' }}>
                        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                            <Box sx={{ alignItems: { sm: 'center' }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, justifyContent: 'space-between', mb: 1.25 }}>
                                <Typography sx={{ fontWeight: 750 }} variant="h6">
                                    Completion progress
                                </Typography>
                                <Typography color="text.secondary" variant="body2">
                                    {metrics.completed} of {metrics.total} tasks completed
                                </Typography>
                            </Box>
                            <LinearProgress
                                aria-label={`Completion progress: ${metrics.completed} of ${metrics.total} tasks, ${metrics.completionPercentage} percent`}
                                color="success"
                                sx={{ borderRadius: 1, height: 10 }}
                                value={metrics.completionPercentage}
                                variant="determinate"
                            />
                            <Typography color="text.secondary" sx={{ display: 'block', mt: 1 }} variant="body2">
                                {metrics.completionPercentage}% complete
                            </Typography>
                        </CardContent>
                    </Card>

                    {metrics.total === 0 ? (
                        <DashboardEmptyState onCreateTask={() => setCreateOpen(true)} />
                    ) : (
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1.2fr)' } }}>
                            <TaskStatusOverview statusMetrics={statusMetrics} />
                            <RecentTasks tasks={recentTasks} />
                        </Box>
                    )}
                </>
            )}

            <TaskFormDialog
                mode="create"
                onClose={() => setCreateOpen(false)}
                onCreated={handleCreated}
                onError={(message) => showNotification(message, 'error')}
                onUpdated={() => undefined}
                open={createOpen}
            />

            {notification && (
                <Snackbar
                    key={notification.key}
                    anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                    autoHideDuration={5000}
                    onClose={() => setNotification(null)}
                    open
                >
                    <Alert
                        onClose={() => setNotification(null)}
                        severity={notification.severity}
                        sx={{ width: '100%' }}
                        variant="filled"
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            )}
        </Stack>
    )
}
