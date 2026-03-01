import { Button, Modal, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TaskForm } from '@/components/TaskForm'
import { TaskListItem } from '@/components/TaskListItem'
import { useValidateTask } from '@/hooks/useValidateTask'
import { useFilteredTasks, useTaskActions, useTaskById } from '@/store/taskStore'
import type { Task } from '@/types'

type View = { type: 'list' } | { type: 'form'; taskId: string }

type Props = {
	projectId: string
	opened: boolean
	onClose: () => void
}

export function WhatsNextModal({ projectId, opened, onClose }: Props) {
	const { t } = useTranslation()
	const [view, setView] = useState<View>({ type: 'list' })
  const backlogTasks = useFilteredTasks({ projectId, status: 'backlog' })

	const { addTask, editTask } = useTaskActions()

	function handleTaskClick(taskId: string) {
		setView({ type: 'form', taskId })
	}

	function handleAddTask() {
		const task = addTask({ title: 'Наступна дія', status: 'backlog', projectId })
		setView({ type: 'form', taskId: task.id })
	}

	function handleCompleteProject() {
		editTask(projectId, { status: 'done' })
		handleClose()
	}

	function handleClose() {
		setView({ type: 'list' })
		onClose()
	}

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={t('whatsNextTitle')}
			centered
			size="lg"
			radius="md"
		>
			{view.type === 'list' ? (
				<Stack gap="md">
					<Text size="sm" c="dimmed">
						{t('projectNoNextAction')}
					</Text>
					{backlogTasks.length > 0 ? (
						<div>
							{backlogTasks.map((task) => (
								<TaskListItem
									key={task.id}
									taskId={task.id}
									displayMeta={['duration']}
									onClick={() => handleTaskClick(task.id)}
								/>
							))}
						</div>
					) : (
						<Text size="sm" c="dimmed" ta="center">
							{t('whatsNextNoBacklog')}
						</Text>
					)}
					<Button onClick={handleAddTask} variant="light" color="blue" w="100%">
						{t('whatsNextAddTask')}
					</Button>
					{backlogTasks.length === 0 && (
						<Button onClick={handleCompleteProject} variant="light" color="green" w="100%">
							{t('whatsNextCompleteProject')}
						</Button>
					)}
				</Stack>
			) : (
				<FormViewOuter
					taskId={view.taskId}
					onBack={() => setView({ type: 'list' })}
					onClose={onClose}
				/>
			)}
		</Modal>
	)
}

function FormViewOuter({
	taskId,
	onBack,
	onClose,
}: {
	taskId: string
	onBack: () => void
	onClose: () => void
}) {
	const task = useTaskById(taskId)
	if (!task) return null
	return <FormViewContent task={task} onBack={onBack} onClose={onClose} />
}

function FormViewContent({
	task,
	onBack,
	onClose,
}: {
	task: Task
	onBack: () => void
	onClose: () => void
}) {
	const { t } = useTranslation()
	const { editTask } = useTaskActions()

	const { canSubmit, errors, handleSubmit } = useValidateTask({
		task,
		fields: ['title', 'context', 'duration'],
		onSubmit: () => {
			editTask(task.id, { status: 'next_action' })
			onClose()
		},
	})

	return (
		<Stack gap="md" align="center">
			<TaskForm
				task={task}
				fields={['title', 'notes', 'context', 'duration', 'dueDate', 'scheduledDate']}
			/>
			{errors.length > 0 && (
				<Stack gap={4} w="100%">
					{errors.map((err) => (
						<Text key={err} size="sm" c="red">
							{err}
						</Text>
					))}
				</Stack>
			)}
			<Button
				onClick={handleSubmit}
				disabled={!canSubmit}
				variant="filled"
				color="blue"
				w="100%"
			>
				{t('processDoneUk')}
			</Button>
			<Button
				onClick={onBack}
				variant="subtle"
				color="gray"
				w="100%"
				leftSection={<ArrowLeft size={14} />}
			>
				{t('processBackUk')}
			</Button>
		</Stack>
	)
}
