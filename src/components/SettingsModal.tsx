import { Button, Modal, Stack, TextInput } from '@mantine/core'
import { useState } from 'react'

import { useAuthStore } from '@/store/authStore'

interface SettingsModalProps {
  opened: boolean
  onClose: () => void
}

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const { apiUrl, setApiUrl } = useAuthStore()
  const [value, setValue] = useState(apiUrl)

  function handleSave() {
    setApiUrl(value.trim() || 'http://localhost:8000')
    onClose()
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
      </Stack>
    </Modal>
  )
}
