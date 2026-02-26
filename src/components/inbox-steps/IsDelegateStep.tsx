import { Button, Group, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep } from '@/store/inboxStepper'

export function IsDelegateStep() {
	const { t } = useTranslation()
	return (
		<Stack gap="md">
			<Text size="md" fw={500}>
				{t('processQ3')}
			</Text>
			<Group gap="sm">
				<Button
					onClick={() => goToInboxStep('3_1_delegate')}
					variant="filled"
					color="orange"
					flex={1}
				>
					{t('processYesUk')}
				</Button>
				<Button
					onClick={() => goToInboxStep('4_0_is_project')}
					variant="light"
					color="gray"
					flex={1}
				>
					{t('processNoUk')}
				</Button>
			</Group>
			<Button
				onClick={() => goToInboxStep('2_0_is_less_then_2_minutes')}
				variant="subtle"
				color="gray"
				size="xs"
				leftSection={<ArrowLeft size={14} />}
			>
				{t('processBackUk')}
			</Button>
		</Stack>
	)
}
