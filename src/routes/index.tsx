import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Stack,
  Title,
  Container,
  Group,
  Text,
  ActionIcon,
  Button,
} from '@mantine/core'
import { Sun, Moon, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTasks, useFilters } from '@/store'
import { Toolbar } from '@/components/Toolbar'
import { LangSelect } from '@/components/LangSelect'
import { TaskListItem } from '@/components/TaskListItem'
import { CommandPalette } from '@/components/CommandPalette'
import { TaskFocusModal } from '@/components/TaskFocusModal'
import { useTheme } from '@/theme'
import type { Task } from '@/types'

export const Route = createFileRoute('/')({ component: App })

const today = new Date().toISOString().slice(0, 10)

function isToday(task: Task) {
  return task.scheduledDate?.slice(0, 10) === today || task.dueDate?.slice(0, 10) === today
}

function applyToolbarFilters(tasks: Task[], context: string | null, todayOnly: boolean, maxMinutes: number | null) {
  return tasks.filter((t) => {
    if (t.isProject) return false
    if (t.status === 'done') return false
    const isNextAction = t.status === 'next_action'
    if (!isNextAction && !isToday(t)) return false
    if (context && t.context !== context) return false
    if (todayOnly && !isToday(t)) return false
    if (maxMinutes !== null && t.estimatedMinutes !== undefined && t.estimatedMinutes > maxMinutes) return false
    return true
  })
}

function groupByArea(tasks: Task[]): { area: string; tasks: Task[] }[] {
  const map = new Map<string, Task[]>()
  for (const task of tasks) {
    const key = task.area ?? ''
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(task)
  }
  return Array.from(map.entries()).map(([area, tasks]) => ({ area, tasks }))
}

type DisplayGroup = { area: string; tasks: Task[]; important?: boolean }

function buildGroups(tasks: Task[]): DisplayGroup[] {
  const todayTasks = tasks.filter(isToday)
  const todayIds = new Set(todayTasks.map((t) => t.id))
  const rest = tasks.filter((t) => !todayIds.has(t.id))

  const areaGroups: DisplayGroup[] = groupByArea(rest).map((g) => ({ ...g, important: false }))

  if (todayTasks.length === 0) return areaGroups
  return [{ area: 'important', tasks: todayTasks, important: true }, ...areaGroups]
}

function App() {
  const { colorScheme, toggleColorScheme } = useTheme()
  const { t } = useTranslation()
  const [cmdOpen, setCmdOpen] = useState(false)

  const { context, todayOnly, maxMinutes } = useFilters()
  const allTasks = useTasks()
  const inboxTasks = useTasks({ status: 'inbox' })
  const tasks = applyToolbarFilters(allTasks, context, todayOnly, maxMinutes)
  const groups = buildGroups(tasks)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <>
      <Group
        gap="xs"
        style={{ position: 'fixed', top: 16, right: 16, zIndex: 200 }}
      >
        {inboxTasks.length > 1 && (
          <Button
            component={Link}
            to="/process-inbox"
            variant="light"
            color="orange"
            size="sm"
            radius="md"
          >
            {t('processInbox')} ({inboxTasks.length})
          </Button>
        )}
        <ActionIcon
          onClick={() => setCmdOpen(true)}
          variant="default"
          size="lg"
          radius="md"
          aria-label={t('cmdPlaceholder')}
        >
          <Search size={18} />
        </ActionIcon>
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
          <Title order={2} ta="center">{t('pageTitle')}</Title>

          {tasks.length === 0 && (
            <Text c="dimmed" size="sm">{t('noTasks')}</Text>
          )}

          {groups.map(({ area, tasks: groupTasks, important }) => (
            <Stack key={area} gap={0}>
              <Text
                size="xs"
                fw={600}
                tt="uppercase"
                style={{
                  letterSpacing: '0.05em',
                  padding: '0 8px',
                  marginBottom: 2,
                  color: important ? 'var(--mantine-color-orange-6)' : 'var(--mantine-color-dimmed)',
                }}
              >
                {important ? t('groupImportant') : t(`area.${area}`, { defaultValue: area })}
              </Text>
              {groupTasks.map((task) => (
                <TaskListItem key={task.id} task={task} isToday={important} />
              ))}
            </Stack>
          ))}
        </Stack>
      </Container>

      <Toolbar />

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <TaskFocusModal />
    </>
  )
}
