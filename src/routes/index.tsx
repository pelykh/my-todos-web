import { ActionIcon, Container, Group, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { Moon, Search, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CommandPalette } from '@/components/CommandPalette'
import { LangSelect } from '@/components/LangSelect'
import { ProcessInboxButton } from '@/components/ProcessInboxButton'
import { TaskFocusModal } from '@/components/TaskFocusModal'
import { TaskListItem } from '@/components/TaskListItem'
import { Toolbar } from '@/components/Toolbar'
import { useFilters, useFocusedTaskActions } from '@/store'
import { useGroupedFilteredTasks } from '@/store/taskStore'
import { useTheme } from '@/theme'
import type { Task } from '@/types'
import { isTaskImportant } from '@/utils/tasks'

export const Route = createFileRoute('/')({ component: App })

const today = new Date().toISOString().slice(0, 10)

function isToday(task: Task) {
	return (
		task.scheduledDate?.slice(0, 10) === today ||
		task.dueDate?.slice(0, 10) === today
	)
}

function applyToolbarFilters(
	tasks: Task[],
	context: string | null,
	todayOnly: boolean,
	maxMinutes: number | null,
) {
	return tasks.filter((t) => {
		if (t.isProject) return false
		if (t.status === 'done') return false
		const isNextAction = t.status === 'next_action'
		if (!isNextAction && !isToday(t)) return false
		if (context && t.context !== context) return false
		if (todayOnly && !isToday(t)) return false
		if (
			maxMinutes !== null &&
			t.estimatedMinutes !== undefined &&
			t.estimatedMinutes > maxMinutes
		)
			return false
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
	// Filter important by project to
	const todayTasks = tasks.filter((t) => isTaskImportant(t, undefined))
	const todayIds = new Set(todayTasks.map((t) => t.id))
	const rest = tasks.filter((t) => !todayIds.has(t.id))

	const areaGroups: DisplayGroup[] = groupByArea(rest).map((g) => ({
		...g,
		important: false,
	}))

	if (todayTasks.length === 0) return areaGroups
	return [
		{ area: 'important', tasks: todayTasks, important: true },
		...areaGroups,
	]
}

function App() {
	const { colorScheme, toggleColorScheme } = useTheme()
	const { t } = useTranslation()
	const [cmdOpen, setCmdOpen] = useState(false)

	const filters = useFilters()
	const setFocusedTaskId = useFocusedTaskActions()
	const groups = useGroupedFilteredTasks({
		filters: {
			...filters,
			status: 'next_action',
		},
		groupBy: 'area',
		useImportant: true,
	})

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
				<ProcessInboxButton />
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
					aria-label={
						colorScheme === 'dark' ? t('ariaThemeLight') : t('ariaThemeDark')
					}
				>
					{colorScheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
				</ActionIcon>
			</Group>

			<Container size="sm" py="xl" pb={120}>
				<Stack gap="lg">
					<Title order={2} ta="center">
						{t('pageTitle')}
					</Title>
					{Object.entries(groups).map(([area, tasks]) => {
						if (tasks.length === 0) return null
						return (
							<Stack key={area} gap={0}>
								<Text
									size="xs"
									fw={600}
									tt="uppercase"
									style={{
										letterSpacing: '0.05em',
										padding: '0 8px',
										marginBottom: 2,
										color:
											area === 'important'
												? 'var(--mantine-color-orange-6)'
												: 'var(--mantine-color-dimmed)',
									}}
								>
									{area === 'important'
										? t('groupImportant')
										: t(`area.${area}`, { defaultValue: area })}
								</Text>
								{tasks.map((task) => (
									<TaskListItem
										key={task.id}
										taskId={task.id}
										status={area === 'important' ? 'important' : undefined}
										displayMeta={['project', 'duration']}
										onClick={() => setFocusedTaskId(task.id)}
									/>
								))}
							</Stack>
						)
					})}
				</Stack>
			</Container>

			<Toolbar />

			<CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

			<TaskFocusModal />
		</>
	)
}
