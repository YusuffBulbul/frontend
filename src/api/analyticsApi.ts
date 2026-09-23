import http from './http'
import type {
    AnalyticsRequestError,
    AnalyticsSummary,
} from '../types/analytics'
import axios from 'axios'

function toSafeNumber(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
        ? value
        : 0
}

function normalizeSummary(value: unknown): AnalyticsSummary {
    const source = typeof value === 'object' && value !== null
        ? value as Record<string, unknown>
        : {}

    return {
        totalTasks: toSafeNumber(source.totalTasks),
        activeTasks: toSafeNumber(source.activeTasks),
        deletedTasks: toSafeNumber(source.deletedTasks),
        todoTasks: toSafeNumber(source.todoTasks),
        inProgressTasks: toSafeNumber(source.inProgressTasks),
        completedTasks: toSafeNumber(source.completedTasks),
        totalNotifications: toSafeNumber(source.totalNotifications),
    }
}

export async function getAnalyticsSummary(options?: { signal?: AbortSignal }): Promise<AnalyticsSummary> {
    const response = await http.get<AnalyticsSummary>(
        '/api/analytics/summary',
        options,
    )

    return normalizeSummary(response.data)
}

export function getAnalyticsError(error: unknown): AnalyticsRequestError {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
        return {
            kind: 'forbidden',
            message: 'You do not have permission to view Analytics.',
        }
    }

    return {
        kind: 'request',
        message: 'Analytics data could not be loaded. Please try again.',
    }
}
