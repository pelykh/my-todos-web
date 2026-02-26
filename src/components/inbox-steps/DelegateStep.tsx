import { Button, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'

type Props = {
	task: { id: string }
	onAdvance: () => void
}

export function DelegateStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { editTask } = useTaskActions()

	return (
		<Stack gap="md">
			<Text size="md" fw={500}>
				{t('processActionDelegate')}
			</Text>
			<Button
				onClick={() => {
					editTask(task.id, { status: 'waiting_for' })
					onAdvance()
				}}
				variant="filled"
				color="orange"
				fullWidth
			>
				{t('processDoneUk')}
			</Button>
			<Button
				onClick={() => goToInboxStep('3_0_is_delegate')}
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
