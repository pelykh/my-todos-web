import { Group, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ShortcutButton } from '@/components/ShortcutButton'
import { TaskCard } from '@/components/TaskCard'
import { goToInboxStep } from '@/store/inboxStepper'

type Props = {
	task: { title: string; notes?: string }
}

export function IsDelegateStep({ task }: Props) {
	const { t } = useTranslation()
	return (
		<Stack gap="md" align="center">
			<TaskCard task={task} />
			<Text size="md" fw={500}>
				{t('processQ3')}
			</Text>
			<Group gap="sm" w="100%" maw={320}>
				<ShortcutButton
					shortcut="1"
					onClick={() => goToInboxStep('3_1_delegate')}
					variant="filled"
					color="green"
					flex={1}
				>
					{t('processYesUk')}
				</ShortcutButton>
				<ShortcutButton
					shortcut="2"
					onClick={() => goToInboxStep('4_0_is_project')}
					variant="light"
					color="gray"
					flex={1}
				>
					{t('processNoUk')}
				</ShortcutButton>
			</Group>
			<ShortcutButton
				shortcut="3"
				onClick={() => goToInboxStep('2_0_is_less_then_2_minutes')}
				variant="subtle"
				color="gray"
				size="xs"
				w="100%"
				maw={320}
				leftSection={<ArrowLeft size={14} />}
			>
				{t('processBackUk')}
			</ShortcutButton>
		</Stack>
	)
}
