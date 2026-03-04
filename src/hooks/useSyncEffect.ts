import { useEffect } from 'react'

import { disconnectSSE, isPullUpdate, pullSync, pushSync, subscribeSSE } from '@/services/SyncService'
import { useAuthStore } from '@/store/authStore'
import { taskStore } from '@/store/taskStore'

const DEBOUNCE_MS = 5000

export function useSyncEffect(): void {
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) return

    void pullSync()
    void pushSync()
    subscribeSSE()

    let timer: ReturnType<typeof setTimeout> | null = null

    const unsubscribe = taskStore.subscribe(() => {
      if (isPullUpdate) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => void pushSync(), DEBOUNCE_MS)
    })

    return () => {
      if (timer) clearTimeout(timer)
      unsubscribe()
      disconnectSSE()
    }
  }, [token])
}
