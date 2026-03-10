import { useEffect } from 'react'

import { disconnectSSE, isPullUpdate, pullSync, pushSync, subscribeSSE } from '@/services/SyncService'
import { useAuthStore } from '@/store/authStore'
import { taskStore } from '@/store/taskStore'

const DEBOUNCE_MS = 5000
const REFETCH_COOLDOWN_MS = 10_000

export function useSyncEffect(): void {
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) return

    void pullSync()
    void pushSync()
    subscribeSSE()

    let lastRefetchAt = 0

    const canRefetch = () => Date.now() - lastRefetchAt >= REFETCH_COOLDOWN_MS

    const handleVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (!canRefetch()) return
      lastRefetchAt = Date.now()
      void pullSync()
    }

    const handleOnline = () => {
      if (!canRefetch()) return
      lastRefetchAt = Date.now()
      disconnectSSE()
      subscribeSSE()
      void pullSync()
    }

    document.addEventListener('visibilitychange', handleVisible)
    window.addEventListener('online', handleOnline)

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
      document.removeEventListener('visibilitychange', handleVisible)
      window.removeEventListener('online', handleOnline)
    }
  }, [token])
}
