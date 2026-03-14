import { ActionIcon, Container, Group, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TaskListItem } from '@/components/TaskListItem'
import { Toolbar } from '@/components/Toolbar'
import { useFilteredTasks } from '@/store/taskStore'

export const Route = createFileRoute('/waiting-for')({ component: WaitingForPage })

function WaitingForPage() {
	const { t } = useTranslation()
	const tasks = useFilteredTasks({ status: 'waiting_for' })

	const sorted = useMemo(
		() =>
			[...tasks].sort((a, b) => {
				const aMs = a.waitingSince ? new Date(a.waitingSince).getTime() : Date.now()
				const bMs = b.waitingSince ? new Date(b.waitingSince).getTime() : Date.now()
				return aMs - bMs
			}),
		[tasks],
	)

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
						{t('waitingFor')}
					</Title>

					<Stack gap={0}>
						{sorted.map((task) => (
							<TaskListItem
								key={task.id}
								taskId={task.id}
								displayMeta={['notes', 'waiting_since']}
								href={`/task/${task.id}`}
							/>
						))}

						{sorted.length === 0 && (
							<Text c="dimmed" ta="center" size="sm">
								{t('waitingForEmpty')}
							</Text>
						)}
					</Stack>
				</Stack>
			</Container>

			<Toolbar />
		</>
	)
}
