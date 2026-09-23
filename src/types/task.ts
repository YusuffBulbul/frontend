export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'

export interface TaskResponse {
    id: string
    userId: string
    title: string
    description: string
    status: TaskStatus
    createdAt: string
}

export interface CreateTaskRequest {
    title: string
    description: string
}

export interface UpdateTaskRequest {
    title: string
    description: string
    status: TaskStatus
}
