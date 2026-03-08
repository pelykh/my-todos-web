import { ActionIcon, Container, Group, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TaskListItem } from '@/components/TaskListItem'
import { Toolbar } from '@/components/Toolbar'
import { useGroupedFilteredTasks } from '@/store/taskStore'

export const Route = createFileRoute('/done')({ component: DonePage })

function DonePage() {
	const { t } = useTranslation()
	const groups = useGroupedFilteredTasks({
		filters: { status: 'done' },
		groupBy: 'area',
	})

	const totalCount = Object.values(groups).reduce((sum, tasks) => sum + tasks.length, 0)

	return (
		<>
			<Group style={{ position: 'fixed', top: 16, left: 16, zIndex: 200 }}>
				<ActionIcon
					component={Link}
					to="/"
					variant="default"
					size="lg"
					radius="md"
					aria-label={t('back')}
				>
					<ArrowLeft size={18} />
				</ActionIcon>
			</Group>
			<Container size="sm" py="xl" pb={120}>
				<Stack gap="lg">
					<Title order={2} ta="center">
						{t('status.done')}
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
