import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { deleteTask, getTaskErrorMessage, getTasks } from '../api/taskApi'
import DeleteTaskDialog from '../components/DeleteTaskDialog'
import TaskCard from '../components/TaskCard'
import TaskFormDialog from '../components/TaskFormDialog'
import type { TaskResponse } from '../types/task'
import type { TaskSortOption, TaskStatusFilter } from '../types/taskFilters'
import { filterAndSortTasks } from '../utils/taskFilters'
import { parseTaskStatus, withTaskStatus } from '../utils/taskQueryParams'
import { useSearchParams } from 'react-router-dom'

const STATUS_FILTER_OPTIONS: Array<{ label: string; value: TaskStatusFilter }> = [
    { label: 'All statuses', value: 'ALL' },
    { label: 'To Do', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
]

const SORT_OPTIONS: Array<{ label: string; value: TaskSortOption }> = [
    { label: 'Newest first', value: 'NEWEST' },
    { label: 'Oldest first', value: 'OLDEST' },
    { label: 'Title A–Z', value: 'TITLE_ASC' },
    { label: 'Title Z–A', value: 'TITLE_DESC' },
]

export default function TasksPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [tasks, setTasks] = useState<TaskResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<TaskSortOption>('NEWEST')
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
    const [formOpen, setFormOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<TaskResponse | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<TaskResponse | null>(null)
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
    const deletingTaskIdRef = useRef<string | null>(null)
    const [notification, setNotification] = useState<{
        key: number
        message: string
        severity: 'success' | 'error'
    } | null>(null)
    const notificationKeyRef = useRef(0)
    const isMountedRef = useRef(true)

    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    useEffect(() => {
        async function loadTasks() {
            try {
                setLoading(true)
                setError(null)

                const response = await getTasks()
                setTasks(response)
            } catch (requestError: unknown) {
                setError(getTaskErrorMessage(requestError, 'Tasks could not be loaded.'))
            } finally {
                setLoading(false)
            }
        }

        void loadTasks()
    }, [])

    const statusFilter = parseTaskStatus(searchParams.get('status'))

    const visibleTasks = useMemo(
        () => filterAndSortTasks(tasks, { search, sort, status: statusFilter }),
        [search, sort, statusFilter, tasks],
    )
    const hasActiveFilters = search.trim().length > 0 || statusFilter !== 'ALL'

    function handleTaskCreated(task: TaskResponse) {
        setTasks((currentTasks) => [task, ...currentTasks])
        showNotification('Task created successfully.', 'success')
    }

    function handleTaskUpdated(updatedTask: TaskResponse) {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task,
            ),
        )
        showNotification('Task updated successfully.', 'success')
    }

    function showNotification(message: string, severity: 'success' | 'error') {
        notificationKeyRef.current += 1
        setNotification({ key: notificationKeyRef.current, message, severity })
    }

    function openDeleteDialog(task: TaskResponse) {
        setFormOpen(false)
        setEditingTask(null)
        setDeleteTarget(task)
    }

    function closeDeleteDialog() {
        if (deletingTaskIdRef.current === null) {
            setDeleteTarget(null)
        }
    }

    async function confirmDelete() {
        if (!deleteTarget || deletingTaskIdRef.current !== null) return

        const task = deleteTarget
        deletingTaskIdRef.current = task.id
        setDeletingTaskId(task.id)
        try {
            await deleteTask(task.id)
            if (isMountedRef.current) {
                setTasks((currentTasks) =>
                    currentTasks.filter((currentTask) => currentTask.id !== task.id),
                )
                setDeleteTarget(null)
                showNotification('Task deleted successfully.', 'success')
            }
        } catch (requestError: unknown) {
            if (isMountedRef.current) {
                showNotification(
                    getTaskErrorMessage(requestError, 'Task could not be deleted.'),
                    'error',
                )
            }
        } finally {
            deletingTaskIdRef.current = null
            if (isMountedRef.current) setDeletingTaskId(null)
        }
    }

    function openCreateDialog() {
        setEditingTask(null)
        setFormMode('create')
        setFormOpen(true)
    }

    function openEditDialog(task: TaskResponse) {
        setEditingTask(task)
        setFormMode('edit')
        setFormOpen(true)
    }

    function closeFormDialog() {
        setFormOpen(false)
        setEditingTask(null)
    }

    function clearFilters() {
        setSearch('')
        setSearchParams((current) => withTaskStatus(current, 'ALL'))
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Box sx={{ alignItems: { sm: 'center' }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h4">Your Tasks</Typography>
                        <Typography color="text.secondary">
                            Manage the tasks assigned to your account.
                        </Typography>
                    </Box>
                    <Button onClick={openCreateDialog} variant="contained">
                        Create task
                    </Button>
                </Box>
            </Box>

            <TaskFormDialog
                mode={formMode}
                onClose={closeFormDialog}
                onCreated={handleTaskCreated}
                onError={(message) => showNotification(message, 'error')}
                onUpdated={handleTaskUpdated}
                open={formOpen}
                task={editingTask}
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Box
                component="section"
                aria-label="Task list filters"
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { md: 'minmax(0, 2fr) repeat(2, minmax(180px, 1fr)) auto', xs: '1fr' },
                    alignItems: 'center',
                }}
            >
                <TextField
                    fullWidth
                    label="Search tasks"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search title or description"
                    value={search}
                />

                <FormControl fullWidth>
                    <InputLabel id="task-status-filter-label">Status</InputLabel>
                    <Select
                        label="Status"
                        labelId="task-status-filter-label"
                        onChange={(event) => {
                            const nextStatus = event.target.value as TaskStatusFilter
                            setSearchParams(
                                (current) => withTaskStatus(current, nextStatus),
                            )
                        }}
                        value={statusFilter}
                    >
                        {STATUS_FILTER_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="task-sort-label">Sort by</InputLabel>
                    <Select
                        label="Sort by"
                        labelId="task-sort-label"
                        onChange={(event) => setSort(event.target.value as TaskSortOption)}
                        value={sort}
                    >
                        {SORT_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    disabled={!hasActiveFilters}
                    onClick={clearFilters}
                    variant="text"
                >
                    Clear filters
                </Button>
            </Box>

            {!loading && !error && tasks.length > 0 && (
                <Typography color="text.secondary" variant="body2">
                    Showing {visibleTasks.length} of {tasks.length} tasks
                </Typography>
            )}

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && !error && tasks.length === 0 && (
                <Alert severity="info">No tasks found.</Alert>
            )}

            {!loading && !error && tasks.length > 0 && visibleTasks.length === 0 && (
                <Alert
                    action={
                        <Button color="inherit" onClick={clearFilters} size="small">
                            Clear filters
                        </Button>
                    }
                    severity="info"
                >
                    No tasks match your filters.
                </Alert>
            )}

            {!loading &&
                !error &&
                visibleTasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                        isDeleting={deletingTaskId === task.id}
                    />
                ))}

            <DeleteTaskDialog
                isDeleting={deletingTaskId !== null}
                onClose={closeDeleteDialog}
                onConfirm={confirmDelete}
                open={deleteTarget !== null}
                task={deleteTarget}
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
