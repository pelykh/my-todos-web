import { Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ShortcutButton } from '@/components/ShortcutButton'
import { TaskCard } from '@/components/TaskCard'
import { goToInboxStep } from '@/store/inboxStepper'
import { useTaskActions } from '@/store/taskStore'

type Props = {
	task: { id: string; title: string; notes?: string }
	onAdvance: () => void
}

export function DelegateStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
  const { editTask } = useTaskActions()

	return (
		<Stack gap="md" align="center">
			<TaskCard task={task} />
			<Text size="md" fw={500}>
				{t('processActionDelegate')}
			</Text>
			<ShortcutButton
				shortcut="1"
				onClick={() => {
					editTask(task.id, { status: 'waiting_for' })
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
				onClick={() => goToInboxStep('3_0_is_delegate')}
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
