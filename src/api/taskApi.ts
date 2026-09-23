import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import http from './http'
import type {
    CreateTaskRequest,
    TaskResponse,
    UpdateTaskRequest,
} from '../types/task'

export function getTaskErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    if (!axios.isAxiosError(error)) {
        return fallbackMessage
    }

    switch (error.response?.status) {
        case 401:
            return 'Your session has expired. Please sign in again.'
        case 403:
            return 'You are not authorized to perform this task action.'
        case 404:
            return 'The requested task could not be found.'
        case 400:
            return 'Please check the task details and try again.'
        default:
            return fallbackMessage
    }
}

export async function getTasks(
    requestConfig?: Pick<AxiosRequestConfig, 'signal'>,
): Promise<TaskResponse[]> {
    const response = await http.get<TaskResponse[]>('/api/tasks', requestConfig)

    return response.data
}

export async function getTask(taskId: string): Promise<TaskResponse> {
    const response = await http.get<TaskResponse>(`/api/tasks/${taskId}`)
    return response.data
}

export async function createTask(
    request: CreateTaskRequest,
): Promise<TaskResponse> {
    const response = await http.post<TaskResponse>('/api/tasks', request)
    return response.data
}

export async function updateTask(
    taskId: string,
    request: UpdateTaskRequest,
): Promise<TaskResponse> {
    const response = await http.put<TaskResponse>(
        `/api/tasks/${taskId}`,
        request,
    )

    return response.data
}

export async function deleteTask(taskId: string): Promise<void> {
    await http.delete<void>(`/api/tasks/${taskId}`)
}
