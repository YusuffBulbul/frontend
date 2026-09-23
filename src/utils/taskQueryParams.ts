import type { TaskStatus } from '../types/task'
import type { TaskStatusFilter } from '../types/taskFilters'

const VALID_STATUSES: readonly TaskStatus[] = [
    'TODO',
    'IN_PROGRESS',
    'COMPLETED',
]

export function parseTaskStatus(value: string | null): TaskStatusFilter {
    return value && VALID_STATUSES.includes(value as TaskStatus)
        ? (value as TaskStatus)
        : 'ALL'
}

export function withTaskStatus(
    params: URLSearchParams,
    status: TaskStatusFilter,
): URLSearchParams {
    const next = new URLSearchParams(params)
    if (status === 'ALL') {
        next.delete('status')
    } else {
        next.set('status', status)
    }
    return next
}
