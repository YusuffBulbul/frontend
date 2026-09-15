import http from './http'
import type {
    CreateTaskRequest,
    Task,
    UpdateTaskRequest,
} from '../types/task'

export async function getTasks(userId: string): Promise<Task[]> {
    const response = await http.get<Task[]>('/api/tasks', {
        params: { userId },
    })

    return response.data
}

export async function getTask(taskId: string): Promise<Task> {
    const response = await http.get<Task>(`/api/tasks/${taskId}`)
    return response.data
}

export async function createTask(
    request: CreateTaskRequest,
): Promise<Task> {
    const response = await http.post<Task>('/api/tasks', request)
    return response.data
}

export async function updateTask(
    taskId: string,
    request: UpdateTaskRequest,
): Promise<Task> {
    const response = await http.put<Task>(
        `/api/tasks/${taskId}`,
        request,
    )

    return response.data
}

export async function deleteTask(taskId: string): Promise<void> {
    await http.delete(`/api/tasks/${taskId}`)
}