import type { TaskResponse, TaskStatus } from '../types/task'
import { groupTasksByStatus, KANBAN_STATUSES } from './taskGrouping'

export interface TaskBoardPosition {
    status: TaskStatus
    index: number
}

function flattenGroups(
    groups: Record<TaskStatus, TaskResponse[]>,
): TaskResponse[] {
    return KANBAN_STATUSES.flatMap((status) => groups[status])
}

export function getTaskPosition(
    tasks: TaskResponse[],
    taskId: string,
): TaskBoardPosition | null {
    const groups = groupTasksByStatus(tasks)
    for (const status of KANBAN_STATUSES) {
        const index = groups[status].findIndex((task) => task.id === taskId)
        if (index >= 0) return { index, status }
    }
    return null
}

export function moveTaskToPosition(
    tasks: TaskResponse[],
    taskId: string,
    targetStatus: TaskStatus,
    targetIndex: number,
): TaskResponse[] {
    const groups = groupTasksByStatus(tasks)
    const sourceStatus = KANBAN_STATUSES.find((status) =>
        groups[status].some((task) => task.id === taskId),
    )
    if (!sourceStatus) return tasks.slice()

    const sourceIndex = groups[sourceStatus].findIndex((task) => task.id === taskId)
    const [task] = groups[sourceStatus].splice(sourceIndex, 1)
    if (!task) return tasks.slice()

    let insertionIndex = Math.max(0, Math.min(targetIndex, groups[targetStatus].length))
    if (sourceStatus === targetStatus && sourceIndex < insertionIndex) {
        insertionIndex -= 1
    }

    groups[targetStatus].splice(insertionIndex, 0, {
        ...task,
        status: targetStatus,
    })
    return flattenGroups(groups)
}

export function restoreTaskPosition(
    tasks: TaskResponse[],
    task: TaskResponse,
    sourceStatus: TaskStatus,
    sourceIndex: number,
): TaskResponse[] {
    const groups = groupTasksByStatus(tasks)
    for (const status of KANBAN_STATUSES) {
        groups[status] = groups[status].filter((currentTask) => currentTask.id !== task.id)
    }
    const insertionIndex = Math.max(0, Math.min(sourceIndex, groups[sourceStatus].length))
    groups[sourceStatus].splice(insertionIndex, 0, { ...task, status: sourceStatus })
    return flattenGroups(groups)
}
