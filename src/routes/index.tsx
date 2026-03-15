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
