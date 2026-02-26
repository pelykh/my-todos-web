import { Button, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'

type Props = {
	task: { id: string }
	onAdvance: () => void
}

export function DescribeTaskStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { editTask } = useTaskActions()

	return (
		<Stack gap="md">
			<Text size="md" fw={500}>
				{t('processClarifyTitle')}
			</Text>
			<Button
				onClick={() => {
					editTask(task.id, { status: 'next_action' })
					onAdvance()
				}}
				variant="filled"
				color="blue"
				fullWidth
			>
				{t('processDoneUk')}
			</Button>
			<Button
				onClick={() => goToInboxStep('4_0_is_project')}
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
