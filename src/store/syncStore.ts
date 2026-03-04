import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SyncState = {
  lastSyncVersion: number
  isSyncing: boolean
  lastSyncedAt: string | null
  error: string | null
  setLastSyncVersion: (v: number) => void
  setSyncing: (v: boolean) => void
  setSyncedAt: (d: string) => void
  setError: (e: string | null) => void
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      lastSyncVersion: 0,
      isSyncing: false,
      lastSyncedAt: null,
      error: null,
      setLastSyncVersion: (v) => set({ lastSyncVersion: v }),
      setSyncing: (v) => set({ isSyncing: v }),
      setSyncedAt: (d) => set({ lastSyncedAt: d }),
      setError: (e) => set({ error: e }),
    }),
    {
      name: 'sync',
      partialize: (s) => ({ lastSyncVersion: s.lastSyncVersion }),
    },
  ),
)
