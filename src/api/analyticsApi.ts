import http from './http'
import type { AnalyticsSummary } from '../types/analytics'

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const response = await http.get<AnalyticsSummary>(
        '/api/analytics/summary',
    )

    return response.data
}