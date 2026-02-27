import { Group, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import { ShortcutButton } from '@/components/ShortcutButton'
import { TaskCard } from '@/components/TaskCard'
import { goToInboxStep } from '@/store/inboxStepper'

type Props = {
	task: { title: string; notes?: string }
}

export function IsActionableStep({ task }: Props) {
	const { t } = useTranslation()
	return (
		<Stack gap="md" align="center">
			<TaskCard task={task} />
			<Text size="md" fw={500} ta="center">
				{t('processQ1')}
			</Text>
			<Group gap="sm" w="100%" maw={320}>
				<ShortcutButton
					shortcut="1"
					onClick={() => goToInboxStep('2_0_is_less_then_2_minutes')}
					variant="filled"
					color="blue"
					flex={1}
				>
					{t('processYesUk')}
				</ShortcutButton>
				<ShortcutButton
					shortcut="2"
					onClick={() => goToInboxStep('1_1_not_action')}
					variant="light"
					color="gray"
					flex={1}
				>
					{t('processNoUk')}
				</ShortcutButton>
			</Group>
		</Stack>
	)
}
