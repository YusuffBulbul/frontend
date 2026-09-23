import { useDraggable, useDroppable } from '@dnd-kit/core'
import type {
    DraggableAttributes,
    DraggableSyntheticListeners,
} from '@dnd-kit/core'
import { Alert, Box, Card, CardContent, Stack, Typography } from '@mui/material'
import type { TaskResponse } from '../../types/task'
import { formatKanbanDate, TASK_STATUS_LABELS } from '../../utils/taskGrouping'

interface KanbanTaskCardProps {
    task: TaskResponse
    isUpdating: boolean
    error: string | null
}

interface KanbanTaskCardViewProps extends KanbanTaskCardProps {
    attributes?: DraggableAttributes
    cardRef?: (node: HTMLElement | null) => void
    isDragOverlay?: boolean
    isDragging?: boolean
    isOver?: boolean
    listeners?: DraggableSyntheticListeners
    transformValue?: string
}

function shortenDescription(description: string): string {
    return description.trim()
}

function KanbanTaskCardView({
    attributes,
    cardRef,
    error,
    isDragOverlay = false,
    isDragging = false,
    isOver = false,
    isUpdating,
    listeners,
    task,
    transformValue,
}: KanbanTaskCardViewProps) {
    const description = shortenDescription(task.description)

    return (
        <Card
            ref={cardRef}
            component="article"
            {...attributes}
            {...listeners}
            aria-label={`Drag task ${task.title}. Current status: ${TASK_STATUS_LABELS[task.status]}.`}
            sx={{
                cursor: isDragOverlay ? 'grabbing' : isUpdating ? 'wait' : isDragging ? 'grabbing' : 'grab',
                minWidth: 0,
                opacity: isDragging ? 0.35 : 1,
                outline: isDragOverlay || isOver ? '2px solid' : undefined,
                outlineColor: isOver ? 'primary.main' : 'transparent',
                touchAction: 'none',
                transform: transformValue,
                transition: isDragging ? 'none' : 'box-shadow 160ms ease',
                '&:focus-visible': {
                    outline: '3px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                },
                '&:hover': {
                    boxShadow: isDragOverlay ? undefined : 3,
                },
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack spacing={1.25}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{ fontWeight: 750, overflowWrap: 'anywhere' }}
                            variant="subtitle1"
                        >
                            {task.title}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                            Created {formatKanbanDate(task.createdAt)}
                        </Typography>
                    </Box>

                    {description && (
                        <Typography
                            color="text.secondary"
                            sx={{
                                display: '-webkit-box',
                                overflow: 'hidden',
                                overflowWrap: 'anywhere',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 3,
                            }}
                            variant="body2"
                        >
                            {description}
                        </Typography>
                    )}

                    {error && <Alert severity="error">{error}</Alert>}

                    {isUpdating && (
                        <Typography color="text.secondary" variant="caption">
                            Saving status…
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    )
}

export function KanbanTaskCardOverlay({
    error,
    isUpdating,
    task,
}: KanbanTaskCardProps) {
    return (
        <KanbanTaskCardView
            error={error}
            isDragOverlay
            isUpdating={isUpdating}
            task={task}
        />
    )
}

export default function KanbanTaskCard({
    task,
    isUpdating,
    error,
}: KanbanTaskCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        data: { status: task.status, taskId: task.id, type: 'task' },
        disabled: isUpdating,
        id: task.id,
    })
    const { isOver, setNodeRef: setDropNodeRef } = useDroppable({
        data: { status: task.status, taskId: task.id, type: 'task' },
        disabled: isUpdating,
        id: `task:${task.id}`,
    })
    const transformValue = transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined

    function setRefs(node: HTMLElement | null) {
        setNodeRef(node)
        setDropNodeRef(node)
    }

    return (
        <KanbanTaskCardView
            attributes={attributes}
            cardRef={setRefs}
            error={error}
            isDragging={isDragging}
            isOver={isOver}
            isUpdating={isUpdating}
            listeners={listeners}
            task={task}
            transformValue={transformValue}
        />
    )
}
