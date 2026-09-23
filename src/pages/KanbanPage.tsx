import {
    closestCenter,
    DndContext,
    defaultKeyboardCoordinateGetter,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import type {
    DragCancelEvent,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    Over,
} from '@dnd-kit/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import {
    Alert,
    Box,
    Button,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material'
import { getTaskErrorMessage, getTasks, updateTask } from '../api/taskApi'
import KanbanColumn from '../components/kanban/KanbanColumn'
import KanbanEmptyState from '../components/kanban/KanbanEmptyState'
import { KanbanTaskCardOverlay } from '../components/kanban/KanbanTaskCard'
import type { TaskResponse, TaskStatus } from '../types/task'
import {
    groupTasksByStatus,
    KANBAN_STATUSES,
    sortTasksByCreatedAt,
    TASK_STATUS_LABELS,
} from '../utils/taskGrouping'
import {
    getTaskPosition,
    moveTaskToPosition,
    restoreTaskPosition,
} from '../utils/taskOrdering'

function KanbanLoading() {
    return (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
            {KANBAN_STATUSES.map((status) => (
                <Stack key={status} spacing={1.5}>
                    <Skeleton height={42} variant="rounded" />
                    <Skeleton height={180} variant="rounded" />
                    <Skeleton height={180} variant="rounded" />
                </Stack>
            ))}
        </Box>
    )
}

function asTaskStatus(value: unknown): TaskStatus | null {
    return typeof value === 'string' && KANBAN_STATUSES.includes(value as TaskStatus)
        ? (value as TaskStatus)
        : null
}

interface DropTarget {
    status: TaskStatus
    taskId: string | null
}

function getDropTarget(over: Over | null): DropTarget | null {
    if (!over) return null
    const data = over.data.current
    const status = asTaskStatus(data?.status) ?? asTaskStatus(over.id)
    if (!status) return null
    const taskId = data?.type === 'task' && typeof data.taskId === 'string'
        ? data.taskId
        : null
    return { status, taskId }
}

function getTargetIndex(
    tasks: TaskResponse[],
    target: DropTarget,
    active: DragEndEvent['active'],
    over: Over,
): number {
    const grouped = groupTasksByStatus(tasks)
    if (!target.taskId) return grouped[target.status].length

    const targetIndex = grouped[target.status].findIndex((task) => task.id === target.taskId)
    if (targetIndex < 0) return grouped[target.status].length

    const activeRect = active.rect.current.translated
    const activeCenter = activeRect ? activeRect.top + activeRect.height / 2 : over.rect.top
    const overCenter = over.rect.top + over.rect.height / 2
    return targetIndex + (activeCenter > overCenter ? 1 : 0)
}

interface DragSnapshot {
    task: TaskResponse
    sourceIndex: number
    sourceStatus: TaskStatus
}

export default function KanbanPage() {
    const [tasks, setTasks] = useState<TaskResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set())
    const [taskErrors, setTaskErrors] = useState<Record<string, string>>({})
    const [requestVersion, setRequestVersion] = useState(0)
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
    const updatingTaskIdsRef = useRef(new Set<string>())
    const dragSnapshotRef = useRef<DragSnapshot | null>(null)
    const clearActiveTaskFrameRef = useRef<number | null>(null)
    const isMountedRef = useRef(true)

    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
            if (clearActiveTaskFrameRef.current !== null) {
                cancelAnimationFrame(clearActiveTaskFrameRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const controller = new AbortController()
        let isActive = true

        async function loadTasks() {
            try {
                setIsLoading(true)
                setError(null)
                const response = await getTasks({ signal: controller.signal })
                if (isActive) setTasks(sortTasksByCreatedAt(response))
            } catch (requestError: unknown) {
                if (isActive && !controller.signal.aborted) {
                    setError(getTaskErrorMessage(requestError, 'Kanban tasks could not be loaded.'))
                }
            } finally {
                if (isActive) setIsLoading(false)
            }
        }

        void loadTasks()
        return () => {
            isActive = false
            controller.abort()
        }
    }, [requestVersion])

    const groupedTasks = useMemo(() => groupTasksByStatus(tasks), [tasks])
    const activeTask = activeTaskId
        ? tasks.find((task) => task.id === activeTaskId) ?? null
        : null
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: defaultKeyboardCoordinateGetter }),
    )
    const announcements = useMemo(() => ({
        onDragCancel: (_event: DragCancelEvent) => 'Dragging cancelled.',
        onDragEnd: ({ active, over }: DragEndEvent) => {
            const task = tasks.find((item) => item.id === String(active.id))
            const target = getDropTarget(over)
            return task && target
                ? `${task.title} moved to ${TASK_STATUS_LABELS[target.status]}.`
                : 'Task was not moved.'
        },
        onDragOver: ({ active, over }: DragOverEvent) => {
            const task = tasks.find((item) => item.id === String(active.id))
            const target = getDropTarget(over)
            return task && target
                ? `${task.title} is over ${TASK_STATUS_LABELS[target.status]}.`
                : 'Task is not over a status column.'
        },
        onDragStart: ({ active }: DragStartEvent) => {
            const task = tasks.find((item) => item.id === String(active.id))
            return task
                ? `Picked up ${task.title}. Current status: ${TASK_STATUS_LABELS[task.status]}.`
                : 'Picked up task.'
        },
    }), [tasks])

    function setUpdating(taskId: string, updating: boolean) {
        setUpdatingTaskIds((current) => {
            const next = new Set(current)
            if (updating) next.add(taskId)
            else next.delete(taskId)
            return next
        })
    }

    async function persistStatusChange(
        snapshot: DragSnapshot,
        nextStatus: TaskStatus,
    ) {
        const { task } = snapshot
        if (updatingTaskIdsRef.current.has(task.id)) return
        updatingTaskIdsRef.current.add(task.id)
        setUpdating(task.id, true)
        setTaskErrors((current) => {
            const next = { ...current }
            delete next[task.id]
            return next
        })

        try {
            const updatedTask = await updateTask(task.id, {
                title: task.title,
                description: task.description,
                status: nextStatus,
            })
            if (isMountedRef.current) {
                setTasks((current) =>
                    current.map((currentTask) =>
                        currentTask.id === updatedTask.id ? updatedTask : currentTask,
                    ),
                )
            }
        } catch (requestError: unknown) {
            if (isMountedRef.current) {
                setTasks((current) =>
                    restoreTaskPosition(
                        current,
                        task,
                        snapshot.sourceStatus,
                        snapshot.sourceIndex,
                    ),
                )
                setTaskErrors((current) => ({
                    ...current,
                    [task.id]: getTaskErrorMessage(
                        requestError,
                        'Task status could not be updated.',
                    ),
                }))
            }
        } finally {
            updatingTaskIdsRef.current.delete(task.id)
            if (isMountedRef.current) setUpdating(task.id, false)
        }
    }

    function handleDragStart({ active }: DragStartEvent) {
        if (clearActiveTaskFrameRef.current !== null) {
            cancelAnimationFrame(clearActiveTaskFrameRef.current)
            clearActiveTaskFrameRef.current = null
        }
        const task = tasks.find((item) => item.id === String(active.id))
        const position = task ? getTaskPosition(tasks, task.id) : null
        if (task && position) {
            dragSnapshotRef.current = {
                sourceIndex: position.index,
                sourceStatus: position.status,
                task,
            }
            setActiveTaskId(task.id)
        }
    }

    function deferActiveTaskClear() {
        if (clearActiveTaskFrameRef.current !== null) {
            cancelAnimationFrame(clearActiveTaskFrameRef.current)
        }
        clearActiveTaskFrameRef.current = requestAnimationFrame(() => {
            clearActiveTaskFrameRef.current = null
            setActiveTaskId(null)
        })
    }

    function handleDragCancel() {
        dragSnapshotRef.current = null
        deferActiveTaskClear()
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        const snapshot = dragSnapshotRef.current
        dragSnapshotRef.current = null
        deferActiveTaskClear()

        const task = snapshot?.task ?? tasks.find((item) => item.id === String(active.id))
        const target = getDropTarget(over)
        if (!snapshot || !task || !over || !target) return
        if (updatingTaskIdsRef.current.has(task.id)) return
        if (target.taskId === task.id) return

        const targetIndex = getTargetIndex(tasks, target, active, over)
        const optimisticTasks = moveTaskToPosition(
            tasks,
            task.id,
            target.status,
            targetIndex,
        )
        const changed = optimisticTasks.some(
            (currentTask, index) => currentTask.id !== tasks[index]?.id || currentTask.status !== tasks[index]?.status,
        )
        if (!changed) return

        setTasks(optimisticTasks)
        if (target.status !== snapshot.sourceStatus) {
            void persistStatusChange(snapshot, target.status)
        }
    }

    if (isLoading) return <KanbanLoading />

    return (
        <Stack spacing={3}>
            <Box sx={{ alignItems: { sm: 'center' }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ fontWeight: 800 }} variant="h4">
                        Personal Kanban
                    </Typography>
                    <Typography color="text.secondary">
                        Drag tasks between columns to move your work forward.
                    </Typography>
                </Box>
                <Button
                    onClick={() => setRequestVersion((version) => version + 1)}
                    startIcon={<RefreshOutlinedIcon />}
                    variant="outlined"
                >
                    Refresh
                </Button>
            </Box>

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

            {!error && tasks.length === 0 ? (
                <KanbanEmptyState
                    message="Your task list is empty. Add your first task to see it on this board."
                    showCreateAction
                    title="Your board is ready"
                />
            ) : (
                !error && (
                    <DndContext
                        accessibility={{ announcements }}
                        collisionDetection={closestCenter}
                        onDragCancel={handleDragCancel}
                        onDragEnd={handleDragEnd}
                        onDragStart={handleDragStart}
                        sensors={sensors}
                    >
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, minWidth: 0 }}>
                            {KANBAN_STATUSES.map((status) => (
                                <KanbanColumn
                                    key={status}
                                    status={status}
                                    taskErrors={taskErrors}
                                    tasks={groupedTasks[status]}
                                    title={TASK_STATUS_LABELS[status]}
                                    updatingTaskIds={updatingTaskIds}
                                />
                            ))}
                        </Box>
                        <DragOverlay dropAnimation={null}>
                            {activeTask ? (
                                <KanbanTaskCardOverlay
                                    error={null}
                                    isUpdating={false}
                                    task={activeTask}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )
            )}
        </Stack>
    )
}
