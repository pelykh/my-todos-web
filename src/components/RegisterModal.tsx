import { Alert, Button, Modal, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'

import { useAuthStore } from '@/store/authStore'

interface RegisterModalProps {
  opened: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function RegisterModal({ opened, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { register } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await register(email, password)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Create account">
      <Stack>
        {error && <Alert color="red">{error}</Alert>}
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          autoFocus
        />
        <PasswordInput
          label="Password"
          description="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
        />
        <Button onClick={() => void handleSubmit()} loading={loading}>
          Create account
        </Button>
        <Text size="sm" ta="center">
          {'Already have an account? '}
          <Text
            component="span"
            c="blue"
            style={{ cursor: 'pointer' }}
            onClick={onSwitchToLogin}
          >
            Sign in
          </Text>
        </Text>
      </Stack>
    </Modal>
  )
}
