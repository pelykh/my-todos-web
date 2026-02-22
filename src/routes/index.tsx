import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Button,
  TextInput,
  Stack,
  Title,
  Container,
  Group,
  Text,
  Badge,
  ActionIcon,
  Paper,
  Select,
} from '@mantine/core'
import { Trash2 } from 'lucide-react'
import { useTasks, useTaskActions } from '@/store'
import type { TaskStatus } from '@/types'

export const Route = createFileRoute('/')({ component: App })

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'next_action', label: 'Next Action' },
  { value: 'waiting_for', label: 'Waiting For' },
  { value: 'someday', label: 'Someday' },
  { value: 'done', label: 'Done' },
]

const STATUS_COLORS: Record<TaskStatus, string> = {
  inbox: 'gray',
  next_action: 'blue',
  waiting_for: 'orange',
  someday: 'violet',
  reference: 'teal',
  done: 'green',
}

function App() {
  const [title, setTitle] = useState('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null)

  const tasks = useTasks(filterStatus ? { status: filterStatus } : undefined)
  const { addTask, removeTask } = useTaskActions()

  function handleAdd() {
    const trimmed = title.trim()
    if (!trimmed) return
    addTask({ title: trimmed, status: 'inbox' })
    setTitle('')
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={2}>My Todos</Title>

        {/* Quick-add form */}
        <Group gap="sm" align="flex-end">
          <TextInput
            style={{ flex: 1 }}
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd}>Add</Button>
        </Group>

        {/* Filter */}
        <Select
          placeholder="Filter by status"
          clearable
          data={STATUS_OPTIONS}
          value={filterStatus}
          onChange={(v) => setFilterStatus(v as TaskStatus | null)}
        />

        {/* Task list */}
        <Stack gap="xs">
          {tasks.length === 0 && (
            <Text c="dimmed" size="sm">No tasks found.</Text>
          )}
          {tasks.map((task) => (
            <Paper key={task.id} withBorder p="sm" radius="md">
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={2}>
                  <Text size="sm" fw={500}>{task.title}</Text>
                  <Group gap="xs">
                    <Badge size="xs" color={STATUS_COLORS[task.status]}>
                      {STATUS_OPTIONS.find((s) => s.value === task.status)?.label ?? task.status}
                    </Badge>
                    {task.area && (
                      <Badge size="xs" variant="outline">{task.area}</Badge>
                    )}
                    {task.isProject && (
                      <Badge size="xs" color="yellow">Project</Badge>
                    )}
                  </Group>
                </Stack>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => removeTask(task.id)}
                  aria-label="Delete task"
                >
                  <Trash2 size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}
