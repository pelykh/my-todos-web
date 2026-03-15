import { Container, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/PageHeader'
import { TaskListItem } from '@/components/TaskListItem'
import { Toolbar } from '@/components/Toolbar'
import { useFilters } from '@/store'
import { useGroupedFilteredTasks } from '@/store/taskStore'
import { isMobile } from '@/utils'

export const Route = createFileRoute('/done')({ component: DonePage })

function DonePage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') navigate({ to: '/' })
		}
		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [])
	const filters = useFilters()
	const groups = useGroupedFilteredTasks({
		filters: { ...filters, status: 'done' },
		groupBy: 'area',
	})

	const totalCount = Object.values(groups).reduce((sum, tasks) => sum + tasks.length, 0)

	return (
		<>
			<PageHeader title={t('status.done')} />
			<Container size="sm" py="xl" pt={64} pb={120}>
				<Stack gap="lg">
					{!isMobile() && (
						<Title order={2} ta="center">
							{t('status.done')}
						</Title>
					)}
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
										color: 'var(--mantine-color-dimmed)',
									}}
								>
									{t(`area.${area}`, { defaultValue: area })}
								</Text>
								{tasks.map((task) => (
									<div key={task.id} className="opacity-50">
										<TaskListItem
											taskId={task.id}
											displayMeta={['project', 'duration']}
											href={task.isProject ? `/project/${task.id}` : `/task/${task.id}`}
										/>
									</div>
								))}
							</Stack>
						)
					})}
					{totalCount === 0 && (
						<Text c="dimmed" ta="center" size="sm">
							{t('noTasks')}
						</Text>
					)}
				</Stack>
			</Container>
			<Toolbar />
		</>
	)
}
