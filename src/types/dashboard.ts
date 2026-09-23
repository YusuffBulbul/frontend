import type { TaskResponse, TaskStatus } from './task'

export interface TaskMetrics {
    total: number
    todo: number
    inProgress: number
    completed: number
    completionPercentage: number
}

export interface TaskStatusMetric {
    status: TaskStatus
    label: string
    count: number
    percentage: number
}

export type RecentTask = Pick<
    TaskResponse,
    'id' | 'title' | 'status' | 'createdAt'
>
