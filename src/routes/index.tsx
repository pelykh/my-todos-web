import { Collapse, Container, Group, Stack, Text, Title } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LoginModal } from '@/components/LoginModal'
import { MorningFlowButton } from '@/components/MorningFlowButton'
import { OverflowMenu } from '@/components/OverflowMenu'
import { ProcessInboxButton } from '@/components/ProcessInboxButton'
import { RegisterModal } from '@/components/RegisterModal'
import { SettingsModal } from '@/components/SettingsModal'
import { TaskListItem } from '@/components/TaskListItem'
import { Toolbar } from '@/components/Toolbar'
import { WeeklyReviewButton } from '@/components/WeeklyReviewButton'
import { useFilters } from '@/store'
import { useAuthStore } from '@/store/authStore'
import { useGroupedFilteredTasks } from '@/store/taskStore'
import type { Task } from '@/types'
import { isMobile } from '@/utils'
import { cn } from '@/utils/cn'

import { CmdContext } from './__root'

export const Route = createFileRoute('/')({ component: App })

const DEFAULT_COLLAPSED_ON_WEEKEND = ['work']

interface TaskGroupProps {
	area: string
	tasks: Task[]
	defaultCollapsed?: boolean
}

function TaskGroup({ area, tasks, defaultCollapsed = false }: TaskGroupProps) {
	const { t } = useTranslation()
	const [collapsed, setCollapsed] = useState(defaultCollapsed)
	const isImportant = area === 'important'

	return (
		<Stack gap={0}>
			<Group
				justify="space-between"
				onClick={() => !isImportant && setCollapsed((c) => !c)}
				className={!isImportant ? 'group/header' : undefined}
				style={{
					padding: '0 8px',
					marginBottom: collapsed ? 0 : 2,
				}}
			>
				<Text
					size="xs"
					fw={600}
					tt="uppercase"
					className={
            cn('cursor-pointer text-(--mantine-color-dimmed)! hover:text-(--mantine-color-placeholder)! transition-colors!',
              isImportant && 'cursor-default text-(--mantine-color-orange-6)! hover:text-(--mantine-color-orange-6)! duration-150')
					}
					style={{ letterSpacing: '0.05em' }}
				>
					{isImportant
						? t('groupImportant')
						: t(`area.${area}`, { defaultValue: area })}
				</Text>
				{collapsed && !isImportant && (
					<IconChevronRight
						size={14}
						className="cursor-pointer text-(--mantine-color-dimmed)! hover:text-(--mantine-color-text)! transition-colors! duration-150"
					/>
				)}
			</Group>
			<Collapse in={!collapsed}>
				{tasks.map((task) => (
					<TaskListItem
						key={task.id}
						taskId={task.id}
						status={isImportant ? 'important' : undefined}
						displayMeta={isMobile() ? [] : ['project', 'due_date', 'duration']}
						href={`/task/${task.id}`}
					/>
				))}
			</Collapse>
		</Stack>
	)
}

function App() {
	const { t } = useTranslation()
	const { openCmd } = useContext(CmdContext)
	const [loginOpen, setLoginOpen] = useState(false)
	const [registerOpen, setRegisterOpen] = useState(false)
	const [settingsOpen, setSettingsOpen] = useState(false)
	const sessionExpired = useAuthStore((s) => s.sessionExpired)

	useEffect(() => {
		if (sessionExpired) setLoginOpen(true)
	}, [sessionExpired])

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

	const isWeekend = [0, 6].includes(new Date().getDay())
	const sortedEntries = Object.entries(groups)
		.filter(([, tasks]) => tasks.length > 0)
		.sort(([aA], [aB]) => {
			const aDefault = isWeekend && DEFAULT_COLLAPSED_ON_WEEKEND.includes(aA) ? 1 : 0
			const bDefault = isWeekend && DEFAULT_COLLAPSED_ON_WEEKEND.includes(aB) ? 1 : 0
			return aDefault - bDefault
		})

	return (
		<>
			<Group
				gap="xs"
				style={{ position: 'fixed', top: 16, right: 16, zIndex: 200 }}
			>
				{!isMobile() && <MorningFlowButton />}
				{!isMobile() && <WeeklyReviewButton />}
				<ProcessInboxButton />
				<OverflowMenu onSettings={() => setSettingsOpen(true)} onSearch={openCmd} />
			</Group>

			<Container size="sm" py="xl" pb={120} px={{ base: 'xs', sm: 'md' }}>
				<Stack gap="lg">
					{!isMobile() && (
						<Title order={2} ta="center">
							{t('pageTitle')}
						</Title>
					)}

					{sortedEntries.map(([area, tasks]) => (
						<TaskGroup
							key={area}
							area={area}
							tasks={tasks}
							defaultCollapsed={isWeekend && DEFAULT_COLLAPSED_ON_WEEKEND.includes(area)}
						/>
					))}

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
