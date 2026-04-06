import { useEffect } from 'react'
import { toast } from 'sonner'
import i18n from '@/i18n'

import { disconnectSSE, isPullUpdate, pullSync, pushSync, subscribeSSE } from '@/services/SyncService'
import { useAuthStore } from '@/store/authStore'
import { taskStore } from '@/store/taskStore'

const DEBOUNCE_MS = 5000
const REFETCH_COOLDOWN_MS = 10_000

export function useSyncEffect(): void {
  const token = useAuthStore((s) => s.token)
  const tokenExpiresAt = useAuthStore((s) => s.tokenExpiresAt)

  useEffect(() => {
    if (!token) return
    if (tokenExpiresAt && new Date(tokenExpiresAt) <= new Date()) {
      useAuthStore.getState().handleUnauthorized()
      toast.error(i18n.t('auth.sessionExpired'))
      return
    }

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
  }, [token, tokenExpiresAt])
}
