import type { TaskStatus } from './task'

export type TaskStatusFilter = 'ALL' | TaskStatus

export type TaskSortOption =
    | 'NEWEST'
    | 'OLDEST'
    | 'TITLE_ASC'
    | 'TITLE_DESC'

export interface TaskListFilters {
    search: string
    status: TaskStatusFilter
    sort: TaskSortOption
}
