import { Alert, Button, Modal, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'

import { useAuthStore } from '@/store/authStore'

interface LoginModalProps {
  opened: boolean
  onClose: () => void
  onSwitchToRegister: () => void
}

export function LoginModal({ opened, onClose, onSwitchToRegister }: LoginModalProps) {
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Sign in" zIndex={400}>
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
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
        />
        <Button onClick={() => void handleSubmit()} loading={loading}>
          Sign in
        </Button>
        <Text size="sm" ta="center">
          {"Don't have an account? "}
          <Text
            component="span"
            c="blue"
            style={{ cursor: 'pointer' }}
            onClick={onSwitchToRegister}
          >
            Register
          </Text>
        </Text>
      </Stack>
    </Modal>
  )
}
