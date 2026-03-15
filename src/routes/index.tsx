import { Container, Group, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LoginModal } from '@/components/LoginModal'
import { MorningFlowButton } from '@/components/MorningFlowButton'
import { OverflowMenu } from '@/components/OverflowMenu'
import { ProcessInboxButton } from '@/components/ProcessInboxButton'
import { RegisterModal } from '@/components/RegisterModal'
import { SettingsModal } from '@/components/SettingsModal'
import { TaskListItem } from '@/components/TaskListItem'
import { Toolbar } from '@/components/Toolbar'
import { useFilters } from '@/store'
import { useGroupedFilteredTasks } from '@/store/taskStore'
import { isMobile } from '@/utils'

import { CmdContext } from './__root'

export const Route = createFileRoute('/')({ component: App })

function App() {
	const { t } = useTranslation()
	const { openCmd } = useContext(CmdContext)
	const [loginOpen, setLoginOpen] = useState(false)
	const [registerOpen, setRegisterOpen] = useState(false)
	const [settingsOpen, setSettingsOpen] = useState(false)

	const filters = useFilters()
	const hasActiveFilters = !!(filters.context || filters.maxEstimatedMinutes)
	const groups = useGroupedFilteredTasks({
		filters: {
			...filters,
			status: 'next_action',
			isProject: false,
			excludeFutureScheduled: true,
		},
		groupBy: 'area',
		useImportant: true,
		sort: { sortBy: 'duration', sortOrder: 'desc' },
	})

	return (
		<>
			<Group
				gap="xs"
				style={{ position: 'fixed', top: 16, right: 16, zIndex: 200 }}
			>
				{!isMobile() && <MorningFlowButton />}
				<ProcessInboxButton />
				<OverflowMenu onSettings={() => setSettingsOpen(true)} onSearch={openCmd} />
			</Group>

			<Container size="sm" py="xl" pb={120} px={{ base: 'xs', sm: 'md' }}>
        <Stack gap="lg">
          {!isMobile() && <Title order={2} ta="center">
            {t('pageTitle')}
          </Title>}

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
										displayMeta={isMobile() ? [] : ['project', 'duration']}
										href={`/task/${task.id}`}
									/>
								))}
							</Stack>
						)
					})}

					{Object.values(groups).every((tasks) => tasks.length === 0) && (
						<div className="flex flex-col items-center gap-3 py-16">
							<svg
								width="96"
								height="96"
								viewBox="0 0 96 96"
								fill="none"
								style={{ color: 'var(--mantine-color-dimmed)', opacity: 0.4 }}
							>
								<circle cx="48" cy="48" r="32" stroke="currentColor" strokeWidth="2" />
								<path
									d="M34 48 L44 58 L62 38"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<circle cx="16" cy="20" r="2.5" fill="currentColor" />
								<circle cx="80" cy="28" r="2" fill="currentColor" />
								<circle cx="12" cy="64" r="2" fill="currentColor" />
								<circle cx="84" cy="60" r="2.5" fill="currentColor" />
								<circle cx="48" cy="8" r="2" fill="currentColor" />
							</svg>
							<Text c="dimmed" size="sm" ta="center">
								{hasActiveFilters ? t('noTasksFiltered') : t('noTasksEmpty')}
							</Text>
						</div>
					)}
				</Stack>
			</Container>

			<Toolbar />

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
