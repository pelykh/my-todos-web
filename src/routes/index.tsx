import { createFileRoute } from '@tanstack/react-router'
import { Button, TextInput, Stack, Title, Container } from '@mantine/core'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <Container size="xs" pt="xl">
      <Stack gap="md">
        <Title order={2}>My Todos</Title>
        <TextInput placeholder="Add a new todo..." />
        <Button>Add</Button>
      </Stack>
    </Container>
  )
}
