import { Button, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'

type Props = {
	task: { id: string }
	onAdvance: () => void
}

export function DoItNowStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { removeTask } = useTaskActions()

	return (
		<Stack gap="md">
			<Text size="md" fw={500}>
				{t('processDoItLabel')}
			</Text>
			<Button
				onClick={() => {
					removeTask(task.id)
					onAdvance()
				}}
				variant="filled"
				color="green"
				fullWidth
			>
				{t('processDoneUk')}
			</Button>
			<Button
				onClick={() => goToInboxStep('2_0_is_less_then_2_minutes')}
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
