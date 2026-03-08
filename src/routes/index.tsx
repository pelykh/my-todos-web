import { ActionIcon, Container, Group, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Archive, CheckCircle2, FolderKanban, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CommandPalette } from '@/components/CommandPalette'
import { LoginModal } from '@/components/LoginModal'
import { OverflowMenu } from '@/components/OverflowMenu'
import { ProcessInboxButton } from '@/components/ProcessInboxButton'
import { RegisterModal } from '@/components/RegisterModal'
import { SettingsModal } from '@/components/SettingsModal'
import { TaskListItem } from '@/components/TaskListItem'
import { Toolbar } from '@/components/Toolbar'
import { useFilters } from '@/store'
import { useGroupedFilteredTasks } from '@/store/taskStore'

export const Route = createFileRoute('/')({ component: App })

function App() {
	const { t } = useTranslation()
	const [cmdOpen, setCmdOpen] = useState(false)
	const [loginOpen, setLoginOpen] = useState(false)
	const [registerOpen, setRegisterOpen] = useState(false)
	const [settingsOpen, setSettingsOpen] = useState(false)

	const filters = useFilters()
	const groups = useGroupedFilteredTasks({
		filters: {
			...filters,
			status: 'next_action',
			isProject: false,
			excludeFutureScheduled: true,
		},
		groupBy: 'area',
		useImportant: true,
		sortBy: 'duration',
		sortOrder: 'desc',
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
					component={Link}
					to="/someday"
					variant="default"
					size="lg"
					radius="md"
					aria-label={t('status.someday')}
				>
					<Archive size={18} />
				</ActionIcon>
				<ActionIcon
					component={Link}
					to="/done"
					variant="default"
					size="lg"
					radius="md"
					aria-label={t('status.done')}
				>
					<CheckCircle2 size={18} />
				</ActionIcon>
				<ActionIcon
					component={Link}
					to="/projects"
					variant="default"
					size="lg"
					radius="md"
					aria-label={t('navProjects', { defaultValue: 'Projects' })}
				>
					<FolderKanban size={18} />
				</ActionIcon>
				<ActionIcon
					onClick={() => setCmdOpen(true)}
					variant="default"
					size="lg"
					radius="md"
					aria-label={t('cmdPlaceholder')}
				>
					<Search size={18} />
				</ActionIcon>
				<OverflowMenu onSettings={() => setSettingsOpen(true)} />
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
										href={`/task/${task.id}`}
									/>
								))}
							</Stack>
						)
					})}
				</Stack>
			</Container>

			<Toolbar />

			<CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

			<LoginModal
				opened={loginOpen}
				onClose={() => setLoginOpen(false)}
				onSwitchToRegister={() => {
					setLoginOpen(false)
					setRegisterOpen(true)
				}}
			/>
			<RegisterModal
				opened={registerOpen}
				onClose={() => setRegisterOpen(false)}
				onSwitchToLogin={() => {
					setRegisterOpen(false)
					setLoginOpen(true)
				}}
			/>
			<SettingsModal opened={settingsOpen} onClose={() => setSettingsOpen(false)} onLoginRequest={() => setLoginOpen(true)} />
		</>
	)
}
