import { fetchEventSource } from '@microsoft/fetch-event-source'

import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'
import { taskStore } from '@/store/taskStore'
import type { Task } from '@/types'

import { ApiClient } from './ApiClient'

const STORAGE_KEY = 'tasks'

function loadLocalTasks(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Task[]
  } catch {
    return []
  }
}

function saveLocalTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function upsertTasks(existing: Task[], incoming: Task[]): Task[] {
  const map = new Map(existing.map((t) => [t.id, t]))
  for (const t of incoming) map.set(t.id, t)
  return Array.from(map.values())
}

export async function pushSync(): Promise<void> {
  const { token, apiUrl } = useAuthStore.getState()
  if (!token) return
  const { setLastSyncVersion, setSyncing, setSyncedAt, setError } = useSyncStore.getState()
  const tasks = taskStore.getState().tasks
  try {
    setSyncing(true)
    setError(null)
    const client = new ApiClient(apiUrl, token)
    const { serverVersion } = await client.pushSync(tasks)
    setLastSyncVersion(serverVersion)
    setSyncedAt(new Date().toISOString())
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Sync failed')
  } finally {
    setSyncing(false)
  }
}

export async function pullSync(): Promise<void> {
  const { token, apiUrl } = useAuthStore.getState()
  if (!token) return
  const { lastSyncVersion, setLastSyncVersion, setError } = useSyncStore.getState()
  try {
    const client = new ApiClient(apiUrl, token)
    const incoming = await client.pullSync(lastSyncVersion)
    if (!incoming.length) return
    const existing = loadLocalTasks()
    const merged = upsertTasks(existing, incoming)
    saveLocalTasks(merged)
    taskStore.setState({ tasks: merged })
    const maxVersion = Math.max(
      ...incoming.map((t) => (t as unknown as { serverVersion?: number }).serverVersion ?? 0),
    )
    if (maxVersion > lastSyncVersion) setLastSyncVersion(maxVersion)
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Pull failed')
  }
}

let sseAbortController: AbortController | null = null

export function subscribeSSE(): void {
  const { token, apiUrl } = useAuthStore.getState()
  if (!token) return
  disconnectSSE()
  sseAbortController = new AbortController()
  void fetchEventSource(`${apiUrl}/events`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: sseAbortController.signal,
    onmessage(ev) {
      try {
        const data = JSON.parse(ev.data) as { type: string }
        if (data.type === 'change') void pullSync()
      } catch {
        // ignore malformed events
      }
    },
    onerror(_err) {
      // fetchEventSource auto-reconnects; errors handled by syncStore.error via pullSync
    },
  })
}

export function disconnectSSE(): void {
  sseAbortController?.abort()
  sseAbortController = null
}
