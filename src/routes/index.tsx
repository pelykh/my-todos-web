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
} from '@mantine/core'
import { Trash2, Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTasks, useTaskActions, useFilters } from '@/store'
import { Toolbar } from '@/components/Toolbar'
import { LangSelect } from '@/components/LangSelect'
import { useTheme } from '@/theme'
import type { TaskStatus, Task } from '@/types'

export const Route = createFileRoute('/')({ component: App })

const STATUS_KEYS: { value: TaskStatus; key: string }[] = [
  { value: 'inbox', key: 'status.inbox' },
  { value: 'next_action', key: 'status.next_action' },
  { value: 'waiting_for', key: 'status.waiting_for' },
  { value: 'someday', key: 'status.someday' },
  { value: 'done', key: 'status.done' },
]

const STATUS_COLORS: Record<TaskStatus, string> = {
  inbox: 'gray',
  next_action: 'blue',
  waiting_for: 'orange',
  someday: 'violet',
  reference: 'teal',
  done: 'green',
}

const today = new Date().toISOString().slice(0, 10)

function applyToolbarFilters(tasks: Task[], context: string | null, todayOnly: boolean, maxMinutes: number | null) {
  return tasks.filter((t) => {
    if (context && t.context !== context) return false
    if (todayOnly && t.scheduledDate?.slice(0, 10) !== today && t.dueDate?.slice(0, 10) !== today) return false
    if (maxMinutes !== null && t.estimatedMinutes !== undefined && t.estimatedMinutes > maxMinutes) return false
    return true
  })
}

function App() {
  const [title, setTitle] = useState('')
  const { colorScheme, toggleColorScheme } = useTheme()
  const { t } = useTranslation()

  const { context, todayOnly, maxMinutes } = useFilters()
  const allTasks = useTasks()
  const tasks = applyToolbarFilters(allTasks, context, todayOnly, maxMinutes)
  const { addTask, removeTask } = useTaskActions()

  function handleAdd() {
    const trimmed = title.trim()
    if (!trimmed) return
    addTask({ title: trimmed, status: 'inbox' })
    setTitle('')
  }

  return (
    <>
      <Group
        gap="xs"
        style={{ position: 'fixed', top: 16, right: 16, zIndex: 200 }}
      >
        <LangSelect />
        <ActionIcon
          onClick={toggleColorScheme}
          variant="default"
          size="lg"
          radius="md"
          aria-label={colorScheme === 'dark' ? t('ariaThemeLight') : t('ariaThemeDark')}
        >
          {colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </ActionIcon>
      </Group>

      <Container size="sm" py="xl" pb={120}>
        <Stack gap="lg">
          <Title order={2}>{t('pageTitle')}</Title>

          {/* Quick-add form */}
          <Group gap="sm" align="flex-end">
            <TextInput
              style={{ flex: 1 }}
              placeholder={t('addPlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd}>{t('addButton')}</Button>
          </Group>

          {/* Task list */}
          <Stack gap="xs">
            {tasks.length === 0 && (
              <Text c="dimmed" size="sm">{t('noTasks')}</Text>
            )}
            {tasks.map((task) => (
              <Paper key={task.id} withBorder p="sm" radius="md">
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>{task.title}</Text>
                    <Group gap="xs">
                      <Badge size="xs" color={STATUS_COLORS[task.status]}>
                        {t(STATUS_KEYS.find((s) => s.value === task.status)?.key ?? task.status)}
                      </Badge>
                      {task.area && (
                        <Badge size="xs" variant="outline">{task.area}</Badge>
                      )}
                      {task.isProject && (
                        <Badge size="xs" color="yellow">{t('project')}</Badge>
                      )}
                      {task.estimatedMinutes && (
                        <Badge size="xs" variant="dot" color="gray">{task.estimatedMinutes}{t('minutesSuffix')}</Badge>
                      )}
                    </Group>
                  </Stack>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeTask(task.id)}
                    aria-label={t('ariaDeleteTask')}
                  >
                    <Trash2 size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Container>

      <Toolbar />
    </>
  )
}
