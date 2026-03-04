import { fetchEventSource } from '@microsoft/fetch-event-source'

import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'
import { taskStore } from '@/store/taskStore'
import type { Task } from '@/types'

import { ApiClient } from './ApiClient'
import { STORAGE_KEY } from './LocalStorageTaskService'

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

async function runPush(tasks: Task[]): Promise<void> {
  const { token, apiUrl } = useAuthStore.getState()
  if (!token) return
  const { setLastSyncVersion, setSyncing, setSyncedAt, setError } = useSyncStore.getState()
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

/** Push all local tasks — used on login to fully sync with the server. */
export async function pushAllSync(): Promise<void> {
  await runPush(taskStore.getState().tasks)
}

/** Push only tasks changed since the last successful push. No-ops if nothing is pending. */
export async function pushSync(): Promise<void> {
  const pending = taskStore.getState().pendingSync
  if (!pending.length) return
  await runPush(pending)
  taskStore.getState().actions.clearPendingSync()
}

export async function pullSync(): Promise<void> {
  const { token, apiUrl } = useAuthStore.getState()
  if (!token) return
  const { lastSyncVersion, setLastSyncVersion, setError } = useSyncStore.getState()
  try {
    setError(null)
    const client = new ApiClient(apiUrl, token)
    const incoming = await client.pullSync(lastSyncVersion)
    if (!incoming.length) return
    const existing = loadLocalTasks()
    const merged = upsertTasks(existing, incoming)
    saveLocalTasks(merged)
    isPullUpdate = true
    taskStore.setState({ tasks: merged })
    isPullUpdate = false
    const maxVersion = Math.max(
      ...incoming.map((t) => (t as unknown as { serverVersion?: number }).serverVersion ?? 0),
    )
    if (maxVersion > lastSyncVersion) setLastSyncVersion(maxVersion)
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Pull failed')
  }
}

// True while pullSync is writing to taskStore — used by useSyncEffect to suppress
// the debounce push that would otherwise re-trigger a server broadcast and loop.
export let isPullUpdate = false

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
