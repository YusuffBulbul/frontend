export interface AnalyticsSummary {
    totalTasks: number
    activeTasks: number
    deletedTasks: number
    todoTasks: number
    inProgressTasks: number
    completedTasks: number
    totalNotifications: number
}

export type AnalyticsRequestErrorKind = 'forbidden' | 'request'

export interface AnalyticsRequestError {
    kind: AnalyticsRequestErrorKind
    message: string
}
