import { Button, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TaskForm } from '@/components/TaskForm'
import { useValidateTask } from '@/hooks/useValidateTask'
import { goToInboxStep, useInboxState } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'
import type { Task } from '@/types'

type Props = {
	task: Task
	projects: { id: string; title: string }[]
	onAdvance: () => void
}

export function ExistingProjectStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { selectedProjectId } = useInboxState()
	const { editTask } = useTaskActions()

	const { canSubmit, errors, handleSubmit } = useValidateTask({
		task,
		fields: ['title', 'context', 'duration'],
		onSubmit: () => {
			editTask(task.id, {
				status: 'next_action',
				projectId: selectedProjectId ?? undefined,
			})
			onAdvance()
		},
	})

	return (
		<Stack gap="md" align="center">
			<Text size="md" fw={500}>
				{t('processClarifyTitle')}
			</Text>
			<Text size="sm" c="dimmed" w="100%">
				{t('processClarifyHint')}
			</Text>
			<TaskForm
				task={task}
				fields={['title', 'notes', 'context', 'duration', 'dueDate', 'scheduledDate']}
			/>
			{errors.length > 0 && (
				<Stack gap={4} w="100%" maw={320}>
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
				maw={320}
			>
				{t('processDoneUk')}
			</Button>
			<Button
				onClick={() => goToInboxStep('4_1_project')}
				variant="subtle"
				color="gray"
				w="100%"
				maw={320}
				leftSection={<ArrowLeft size={14} />}
			>
				{t('processBackUk')}
			</Button>
		</Stack>
	)
}
