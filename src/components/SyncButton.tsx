import { ActionIcon, Tooltip } from '@mantine/core'
import { Cloud, CloudOff, RefreshCw } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'

interface SyncButtonProps {
  onLoginRequest: () => void
}

export function SyncButton({ onLoginRequest }: SyncButtonProps) {
  const token = useAuthStore((s) => s.token)
  const { isSyncing, lastSyncedAt, error } = useSyncStore()

  if (!token) {
    return (
      <Tooltip label="Sync — click to sign in">
        <ActionIcon variant="default" size="lg" radius="md" onClick={onLoginRequest}>
          <Cloud size={18} style={{ opacity: 0.4 }} />
        </ActionIcon>
      </Tooltip>
    )
  }

  if (isSyncing) {
    return (
      <ActionIcon variant="default" size="lg" radius="md" disabled>
        <RefreshCw
          size={18}
          style={{ animation: 'spin 1s linear infinite' }}
        />
      </ActionIcon>
    )
  }

  if (error) {
    return (
      <Tooltip label={`Sync error: ${error}`} color="red">
        <ActionIcon variant="default" size="lg" radius="md" color="red">
          <CloudOff size={18} />
        </ActionIcon>
      </Tooltip>
    )
  }

  const label = lastSyncedAt
    ? `Synced at ${new Date(lastSyncedAt).toLocaleTimeString()}`
    : 'Synced'

  return (
    <Tooltip label={label}>
      <ActionIcon variant="default" size="lg" radius="md" color="green">
        <Cloud size={18} />
      </ActionIcon>
    </Tooltip>
  )
}
