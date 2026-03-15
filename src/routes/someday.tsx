import { Container, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/PageHeader'
import { TaskListItem } from '@/components/TaskListItem'
import { useGroupedFilteredTasks } from '@/store/taskStore'
import { isMobile } from '@/utils'

export const Route = createFileRoute('/someday')({ component: SomedayPage })

function SomedayPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') navigate({ to: '/' })
		}
		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [])
	const groups = useGroupedFilteredTasks({
		filters: { status: 'someday' },
		groupBy: 'area',
	})

	const totalCount = Object.values(groups).reduce((sum, tasks) => sum + tasks.length, 0)

	return (
		<>
			<PageHeader title={t('status.someday')} />
			<Container size="sm" py="xl" pt={64} pb="xl">
				<Stack gap="lg">
					{!isMobile() && (
						<Title order={2} ta="center">
							{t('status.someday')}
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
									<TaskListItem
										key={task.id}
										taskId={task.id}
										displayMeta={['project', 'duration']}
										href={task.isProject ? `/project/${task.id}` : `/task/${task.id}`}
									/>
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
		</>
	)
}
