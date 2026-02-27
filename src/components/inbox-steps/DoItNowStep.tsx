import { Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CountdownTimer } from '@/components/CountdownTimer'
import { ShortcutButton } from '@/components/ShortcutButton'
import { TaskCard } from '@/components/TaskCard'
import { goToInboxStep } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'
import type { Task } from '@/types'

type Props = {
	task: Task
	onAdvance: () => void
}

export function DoItNowStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { removeTask } = useTaskActions()

	return (
		<Stack gap="md" align="center">
      <TaskCard task={task} />
			<CountdownTimer seconds={120} />
			<Text size="md" fw={500}>
				{t('processDoItLabel')}
      </Text>
			<ShortcutButton
				shortcut="1"
				onClick={() => {
					removeTask(task.id)
					onAdvance()
				}}
				variant="filled"
				color="green"
				w="100%"
				maw={320}
			>
				{t('processDoneUk')}
			</ShortcutButton>
			<ShortcutButton
				shortcut="2"
				onClick={() => goToInboxStep('2_0_is_less_then_2_minutes')}
				variant="subtle"
				color="gray"
				w="100%"
				maw={320}
				leftSection={<ArrowLeft size={14} />}
			>
				{t('processBackUk')}
			</ShortcutButton>
		</Stack>
	)
}
