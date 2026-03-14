import { Button, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TaskForm } from '@/components/TaskForm'
import { useValidateTask } from '@/hooks/useValidateTask'
import { goToInboxStep } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'
import type { Task } from '@/types'

type Props = {
	task: Task
	onAdvance: () => void
}

export function DelegateStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { editTask } = useTaskActions()

	const { canSubmit, errors, handleSubmit } = useValidateTask({
		task,
		fields: ['title'],
		onSubmit: () => {
			editTask(task.id, {
				status: 'waiting_for',
				waitingSince: new Date().toISOString(),
			})
			onAdvance()
		},
	})

	return (
		<Stack gap="md" align="center">
			<Text size="md" fw={500}>
				{t('processActionDelegate')}
			</Text>
			<Text size="sm" c="dimmed" w="100%">
				{t('processDelegateHint')}
			</Text>
			<TaskForm task={task} fields={['title', 'notes']} />
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
				color="green"
				w="100%"
				maw={320}
			>
				{t('processDoneUk')}
			</Button>
			<Button
				onClick={() => goToInboxStep('3_0_is_delegate')}
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
