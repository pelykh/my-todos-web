import { Button, Stack, TextInput } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep, patchInboxState, useInboxState } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'

type Props = {
	task: { id: string }
	onAdvance: () => void
}

export function NewProjectStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { newProjectName } = useInboxState()
	const { editTask, addTask } = useTaskActions()

	return (
		<Stack gap="md">
			<TextInput
				label={t('projectNamePlaceholder')}
				placeholder={t('projectNamePlaceholder')}
				value={newProjectName}
				onChange={(e) =>
					patchInboxState({ newProjectName: e.currentTarget.value })
				}
			/>
			<Button
				onClick={() => {
					const project = addTask({
						title: newProjectName.trim(),
						status: 'next_action',
						isProject: true,
					})
					editTask(task.id, { status: 'next_action', projectId: project.id })
					onAdvance()
				}}
				variant="filled"
				color="blue"
				fullWidth
				disabled={!newProjectName.trim()}
			>
				{t('processDoneUk')}
			</Button>
			<Button
				onClick={() => goToInboxStep('4_1_project')}
				variant="subtle"
				color="gray"
				fullWidth
				leftSection={<ArrowLeft size={14} />}
			>
				{t('processBackUk')}
			</Button>
		</Stack>
	)
}
