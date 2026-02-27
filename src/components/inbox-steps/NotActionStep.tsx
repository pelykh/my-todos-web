import { Group, Stack } from '@mantine/core'
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

export function NotActionStep({ task, onAdvance }: Props) {
	const { t } = useTranslation()
	const { editTask, removeTask } = useTaskActions()

	return (
		<Stack gap="sm" align="center">
			<TaskCard task={task} />
			<Group gap="sm" w="100%" maw={320}>
				<ShortcutButton
					shortcut="1"
					onClick={() => goToInboxStep('1_1_1_reference')}
					variant="light"
					color="blue"
					flex={1}
				>
					{t('processReferenceUk')}
				</ShortcutButton>
				<ShortcutButton
					shortcut="2"
					onClick={() => {
						editTask(task.id, { status: 'someday' })
						onAdvance()
					}}
					variant="light"
					color="violet"
					flex={1}
				>
					{t('processSomedayUk')}
				</ShortcutButton>
			</Group>
			<Group gap="sm" w="100%" maw={320}>
				<ShortcutButton
					shortcut="3"
					onClick={() => goToInboxStep('1_0_is_actionable')}
					variant="subtle"
					color="gray"
					flex={1}
					leftSection={<ArrowLeft size={14} />}
				>
					{t('processBackUk')}
				</ShortcutButton>
				<ShortcutButton
					shortcut="0"
					onClick={() => {
						removeTask(task.id)
						onAdvance()
					}}
					variant="light"
					color="red"
					flex={1}
				>
					{t('processDeleteUk')}
				</ShortcutButton>
			</Group>
		</Stack>
	)
}
