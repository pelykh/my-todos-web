import { Button, Stack } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'

type Props = {
	task: { id: string }
	onAdvance: () => void
}

export function NotActionStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { editTask, removeTask } = useTaskActions()

	return (
		<Stack gap="sm">
			<Button
				onClick={() => goToInboxStep('1_1_1_reference')}
				variant="light"
				color="blue"
				fullWidth
			>
				{t('processReferenceUk')}
			</Button>
			<Button
				onClick={() => {
					editTask(task.id, { status: 'someday' })
					onAdvance()
				}}
				variant="light"
				color="violet"
				fullWidth
			>
				{t('processSomedayUk')}
			</Button>
			<Button
				onClick={() => goToInboxStep('1_0_is_actionable')}
				variant="subtle"
				color="gray"
				fullWidth
				leftSection={<ArrowLeft size={14} />}
			>
				{t('processBackUk')}
			</Button>
			<Button
				onClick={() => {
					removeTask(task.id)
					onAdvance()
				}}
				variant="light"
				color="red"
				fullWidth
			>
				{t('processDeleteUk')}
			</Button>
		</Stack>
	)
}
