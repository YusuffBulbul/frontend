import type {
    RecentTask,
    TaskMetrics,
    TaskStatusMetric,
} from '../types/dashboard'
import type { TaskResponse } from '../types/task'

const STATUS_LABELS = {
    TODO: 'To do',
    IN_PROGRESS: 'In progress',
    COMPLETED: 'Completed',
} as const

function getTimestamp(value: string): number | null {
    const timestamp = Date.parse(value)
    return Number.isFinite(timestamp) ? timestamp : null
}

export function getTaskMetrics(tasks: TaskResponse[]): TaskMetrics {
    const todo = tasks.filter((task) => task.status === 'TODO').length
    const inProgress = tasks.filter(
        (task) => task.status === 'IN_PROGRESS',
    ).length
    const completed = tasks.filter(
        (task) => task.status === 'COMPLETED',
    ).length
    const total = tasks.length

    return {
        total,
        todo,
        inProgress,
        completed,
        completionPercentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    }
}

export function getTaskStatusMetrics(
    metrics: TaskMetrics,
): TaskStatusMetric[] {
    const getPercentage = (count: number) =>
        metrics.total === 0 ? 0 : Math.round((count / metrics.total) * 100)

    return [
        {
            status: 'TODO',
            label: STATUS_LABELS.TODO,
            count: metrics.todo,
            percentage: getPercentage(metrics.todo),
        },
        {
            status: 'IN_PROGRESS',
            label: STATUS_LABELS.IN_PROGRESS,
            count: metrics.inProgress,
            percentage: getPercentage(metrics.inProgress),
        },
        {
            status: 'COMPLETED',
            label: STATUS_LABELS.COMPLETED,
            count: metrics.completed,
            percentage: getPercentage(metrics.completed),
        },
    ]
}

export function getRecentTasks(tasks: TaskResponse[]): RecentTask[] {
    return [...tasks]
        .sort(
            (left, right) =>
                (getTimestamp(right.createdAt) ?? 0) -
                (getTimestamp(left.createdAt) ?? 0),
        )
        .slice(0, 5)
}

export function formatTaskDate(value: string): string {
    const timestamp = getTimestamp(value)
    if (timestamp === null) {
        return 'Date unavailable'
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(timestamp))
}
