import { Button, Divider, Group, Modal, Stack, Text, TextInput } from '@mantine/core'
import { useEffect, useState } from 'react'

import { pushAllSync } from '@/services/SyncService'
import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'

import { SyncButton } from './SyncButton'

interface SettingsModalProps {
  opened: boolean
  onClose: () => void
  onLoginRequest: () => void
}

export function SettingsModal({ opened, onClose, onLoginRequest }: SettingsModalProps) {
  const { apiUrl, setApiUrl } = useAuthStore()
  const [value, setValue] = useState(apiUrl)
  const { isSyncing } = useSyncStore()

  useEffect(() => {
    if (opened) setValue(apiUrl)
  }, [opened, apiUrl])

  function handleSave() {
    setApiUrl(value.trim() || 'http://localhost:8000')
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Settings">
      <Stack>
        <TextInput
          label="Backend URL"
          description="URL of your my-todos backend server"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          placeholder="http://localhost:8000"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <Button onClick={handleSave}>Save</Button>

        <Divider />

        <Stack gap="xs">
          <Text size="sm" fw={500}>Sync</Text>
          <Group>
            <SyncButton onLoginRequest={onLoginRequest} />
            <Button
              variant="default"
              size="sm"
              loading={isSyncing}
              onClick={() => void pushAllSync()}
            >
              Sync all to server
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  )
}
