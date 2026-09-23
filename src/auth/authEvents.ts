type SessionExpiredListener = () => void

const listeners = new Set<SessionExpiredListener>()
let sessionExpiredNotified = false

export function subscribeToSessionExpired(
    listener: SessionExpiredListener,
): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export function notifySessionExpired(): void {
    if (sessionExpiredNotified) return
    sessionExpiredNotified = true
    listeners.forEach((listener) => listener())
}

export function resetSessionExpiredNotification(): void {
    sessionExpiredNotified = false
}
