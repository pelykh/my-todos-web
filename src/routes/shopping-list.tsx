import { Container, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/PageHeader'
import { TaskListItem } from '@/components/TaskListItem'
import { useFilteredTasks, useTaskActions } from '@/store/taskStore'
import { isMobile } from '@/utils'

export const Route = createFileRoute('/shopping-list')({ component: ShoppingListPage })

function ShoppingListPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { editTask } = useTaskActions()

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') navigate({ to: '/' })
		}
		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [])
	const today = new Date().toISOString().slice(0, 10)

	const backlogItems = useFilteredTasks({ status: 'backlog', tags: ['shopping_list'] })
	const allDoneItems = useFilteredTasks({ status: 'done', tags: ['shopping_list'] })
	const doneItems = allDoneItems.filter((t) => t.updatedAt.slice(0, 10) === today)

	return (
		<>
			<PageHeader title={t('shoppingList')} />
			<Container size="sm" py="xl" pt={64} pb="xl">
				<Stack gap="lg">
					{!isMobile() && (
						<Title order={2} ta="center">
							{t('shoppingList')}
						</Title>
					)}

					<Stack gap={0}>
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
							{t('shoppingListToBuy')}
						</Text>
						{backlogItems.map((task) => (
							<TaskListItem
								key={task.id}
								taskId={task.id}
								displayMeta={[]}
								onClick={() =>
									editTask(task.id, {
										status: 'done',
										completedAt: new Date().toISOString(),
									})
								}
							/>
						))}
						{backlogItems.length === 0 && (
							<Text c="dimmed" ta="center" size="sm" py="xs">
								{t('noTasks')}
							</Text>
						)}
					</Stack>

					{doneItems.length > 0 && (
						<Stack gap={0}>
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
								{t('shoppingListDoneToday')}
							</Text>
							{doneItems.map((task) => (
								<div key={task.id} className="opacity-50">
									<TaskListItem
										taskId={task.id}
										displayMeta={[]}
										onClick={() => editTask(task.id, { status: 'backlog' })}
									/>
								</div>
							))}
						</Stack>
					)}
				</Stack>
			</Container>
		</>
	)
}
