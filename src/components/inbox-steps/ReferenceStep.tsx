import { Button, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'

type Props = {
	task: { id: string }
	onAdvance: () => void
}

export function ReferenceStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { editTask } = useTaskActions()

	return (
		<Stack gap="md">
			<Text size="md" c="dimmed">
				{t('processReferenceHint')}
			</Text>
			<Button
				onClick={() => {
					editTask(task.id, { status: 'reference' })
					onAdvance()
				}}
				variant="filled"
				color="blue"
				fullWidth
			>
				{t('processReferenceSavedUk')}
			</Button>
			<Button
				onClick={() => goToInboxStep('1_1_not_action')}
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
