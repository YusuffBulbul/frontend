import { useDroppable } from '@dnd-kit/core'
import { Badge, Box, Paper, Stack, Typography } from '@mui/material'
import type { TaskResponse, TaskStatus } from '../../types/task'
import KanbanEmptyState from './KanbanEmptyState'
import KanbanTaskCard from './KanbanTaskCard'

interface KanbanColumnProps {
    status: TaskStatus
    title: string
    tasks: TaskResponse[]
    updatingTaskIds: ReadonlySet<string>
    taskErrors: Record<string, string>
}

export default function KanbanColumn({
    status,
    title,
    tasks,
    updatingTaskIds,
    taskErrors,
}: KanbanColumnProps) {
    const { isOver, setNodeRef } = useDroppable({ id: status })

    return (
        <Paper
            ref={setNodeRef}
            component="section"
            variant="outlined"
            aria-label={`${title} column with ${tasks.length} tasks`}
            sx={{
                backgroundColor: isOver ? 'rgba(25, 118, 210, 0.08)' : '#f8f9fc',
                borderColor: isOver ? 'primary.main' : 'divider',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 180,
                minWidth: 0,
                p: { xs: 1.5, sm: 2 },
                transition: 'background-color 160ms ease, border-color 160ms ease',
            }}
        >
            <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
                <Typography sx={{ fontWeight: 800 }} variant="h6">
                    {title}
                </Typography>
                <Badge
                    badgeContent={tasks.length}
                    color={status === 'COMPLETED' ? 'success' : 'primary'}
                    max={999}
                    showZero
                    sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none' } }}
                />
            </Box>
            {tasks.length === 0 ? (
                <KanbanEmptyState
                    message={`Drop tasks here to mark them ${title.toLowerCase()}.`}
                    title="Nothing here"
                />
            ) : (
                <Stack spacing={1.5}>
                    {tasks.map((task) => (
                        <KanbanTaskCard
                            error={taskErrors[task.id] ?? null}
                            isUpdating={updatingTaskIds.has(task.id)}
                            key={task.id}
                            task={task}
                        />
                    ))}
                </Stack>
            )}
        </Paper>
    )
}
