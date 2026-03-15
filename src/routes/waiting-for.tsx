import { Container, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/PageHeader'
import { TaskListItem } from '@/components/TaskListItem'
import { useFilteredTasks } from '@/store/taskStore'
import { isMobile } from '@/utils'

export const Route = createFileRoute('/waiting-for')({ component: WaitingForPage })

function WaitingForPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') navigate({ to: '/' })
		}
		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [])
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
			<PageHeader title={t('waitingFor')} />
			<Container size="sm" py="xl" pt={64} pb="xl">
				<Stack gap="lg">
					{!isMobile() && (
						<Title order={2} ta="center">
							{t('waitingFor')}
						</Title>
					)}

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
		</>
	)
}
