import { Group, Stack, Text } from '@mantine/core'
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

export function ReferenceStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { editTask } = useTaskActions()

	return (
		<Stack gap="md" align="center">
			<TaskCard task={task} />
			<Text size="md" c="dimmed" ta="center" w="100%" maw={320}>
				{t('processReferenceHint')}
			</Text>
			<Group gap="sm" w="100%" maw={320}>
				<ShortcutButton
					shortcut="1"
					onClick={() => {
						editTask(task.id, { status: 'reference' })
						onAdvance()
					}}
					variant="filled"
					color="blue"
					flex={1}
				>
					{t('processReferenceSavedUk')}
				</ShortcutButton>
				<ShortcutButton
					shortcut="2"
					onClick={() => goToInboxStep('1_1_not_action')}
					variant="subtle"
					color="gray"
					flex={1}
					leftSection={<ArrowLeft size={14} />}
				>
					{t('processBackUk')}
				</ShortcutButton>
			</Group>
		</Stack>
	)
}
