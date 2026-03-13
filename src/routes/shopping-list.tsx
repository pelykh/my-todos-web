import { ActionIcon, Container, Group, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TaskListItem } from '@/components/TaskListItem'
import { Toolbar } from '@/components/Toolbar'
import { useFilteredTasks, useTaskActions } from '@/store/taskStore'

export const Route = createFileRoute('/shopping-list')({ component: ShoppingListPage })

function ShoppingListPage() {
	const { t } = useTranslation()
	const { editTask } = useTaskActions()
	const today = new Date().toISOString().slice(0, 10)

	const backlogItems = useFilteredTasks({ status: 'backlog', tags: ['shopping_list'] })
	const allDoneItems = useFilteredTasks({ status: 'done', tags: ['shopping_list'] })
	const doneItems = allDoneItems.filter((t) => t.updatedAt.slice(0, 10) === today)

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
						{t('shoppingList')}
					</Title>

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
			<Toolbar />
		</>
	)
}
