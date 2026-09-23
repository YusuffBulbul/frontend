import type { TaskResponse } from '../types/task'
import type { TaskListFilters } from '../types/taskFilters'

function normalizedSearch(value: string | null | undefined): string {
    return (value ?? '').trim().toLocaleLowerCase()
}

function timestampOrNull(value: string | null | undefined): number | null {
    if (!value) return null
    const timestamp = Date.parse(value)
    return Number.isFinite(timestamp) ? timestamp : null
}

function compareDates(
    left: TaskResponse,
    right: TaskResponse,
    direction: 'asc' | 'desc',
): number {
    const leftTime = timestampOrNull(left.createdAt)
    const rightTime = timestampOrNull(right.createdAt)
    if (leftTime === null && rightTime === null) return 0
    if (leftTime === null) return 1
    if (rightTime === null) return -1
    return direction === 'asc' ? leftTime - rightTime : rightTime - leftTime
}

export function filterAndSortTasks(
    tasks: TaskResponse[],
    filters: TaskListFilters,
): TaskResponse[] {
    const search = normalizedSearch(filters.search)
    const filtered = tasks.filter((task) => {
        const matchesSearch = !search ||
            normalizedSearch(task.title).includes(search) ||
            normalizedSearch(task.description).includes(search)
        const matchesStatus = filters.status === 'ALL' || task.status === filters.status
        return matchesSearch && matchesStatus
    })

    return [...filtered].sort((left, right) => {
        switch (filters.sort) {
            case 'OLDEST':
                return compareDates(left, right, 'asc')
            case 'TITLE_ASC':
                return normalizedSearch(left.title).localeCompare(normalizedSearch(right.title))
            case 'TITLE_DESC':
                return normalizedSearch(right.title).localeCompare(normalizedSearch(left.title))
            case 'NEWEST':
            default:
                return compareDates(left, right, 'desc')
        }
    })
}
