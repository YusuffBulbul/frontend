import type { TaskResponse, TaskStatus } from '../types/task'

export const KANBAN_STATUSES: TaskStatus[] = [
    'TODO',
    'IN_PROGRESS',
    'COMPLETED',
]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
}

function getTimestamp(value: string): number | null {
    const timestamp = Date.parse(value)
    return Number.isFinite(timestamp) ? timestamp : null
}

export function sortTasksByCreatedAt(tasks: TaskResponse[]): TaskResponse[] {
    return [...tasks].sort(
        (left, right) =>
            (getTimestamp(right.createdAt) ?? 0) -
            (getTimestamp(left.createdAt) ?? 0),
    )
}

export function groupTasksByStatus(
    tasks: TaskResponse[],
): Record<TaskStatus, TaskResponse[]> {
    const grouped: Record<TaskStatus, TaskResponse[]> = {
        TODO: [],
        IN_PROGRESS: [],
        COMPLETED: [],
    }

    for (const task of tasks) {
        grouped[task.status].push(task)
    }

    return grouped
}

export function formatKanbanDate(value: string): string {
    const timestamp = getTimestamp(value)
    if (timestamp === null) return 'Date unavailable'

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(timestamp))
}
