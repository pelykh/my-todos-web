import { Button, Divider, Group, Modal, SegmentedControl, Stack, Text, TextInput } from '@mantine/core'
import { useEffect, useState } from 'react'

import { pushAllSync } from '@/services/SyncService'
import { useAuthStore } from '@/store/authStore'
import { type HapticMode, useSettingsStore } from '@/store/settingsStore'
import { useSyncStore } from '@/store/syncStore'

import { SyncButton } from './SyncButton'

const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

interface SettingsModalProps {
  opened: boolean
  onClose: () => void
  onLoginRequest: () => void
}

export function SettingsModal({ opened, onClose, onLoginRequest }: SettingsModalProps) {
  const { apiUrl, setApiUrl } = useAuthStore()
  const [value, setValue] = useState(apiUrl)
  const { isSyncing } = useSyncStore()
  const { hapticMode, setHapticMode } = useSettingsStore()

  const hapticOptions = [
    { label: 'Sound', value: 'sound' },
    ...(isMobile ? [{ label: 'Vibration', value: 'vibration' }] : []),
    { label: 'Off', value: 'off' },
  ]

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
          <Text size="sm" fw={500}>Haptic feedback</Text>
          <SegmentedControl
            data={hapticOptions}
            value={hapticMode}
            onChange={(v) => setHapticMode(v as HapticMode)}
            size="sm"
          />
        </Stack>

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
