import { Button, Select, Stack } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep, patchInboxState, useInboxState } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'

type Props = {
	task: { id: string }
	projects: { id: string; title: string }[]
	onAdvance: () => void
}

export function ExistingProjectStep({ task, projects, onAdvance }: Props) {
	const { t } = useTranslation()
	const { selectedProjectId } = useInboxState()
	const { editTask } = useTaskActions()

	return (
		<Stack gap="md">
			<Select
				label={t('project')}
				data={projects.map((p) => ({ value: p.id, label: p.title }))}
				value={selectedProjectId}
				onChange={(v) => patchInboxState({ selectedProjectId: v })}
			/>
			<Button
				onClick={() => {
					if (!selectedProjectId) return
					editTask(task.id, {
						status: 'next_action',
						projectId: selectedProjectId,
					})
					onAdvance()
				}}
				variant="filled"
				color="blue"
				fullWidth
				disabled={!selectedProjectId}
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
