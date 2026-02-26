import { Button, Group, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep } from '@/store/inboxStepper'

export function IsLessThan2MinutesStep() {
	const { t } = useTranslation()
	return (
		<Stack gap="md">
			<Text size="md" fw={500}>
				{t('processQ2')}
			</Text>
			<Group gap="sm">
				<Button
					onClick={() => goToInboxStep('2_1_less_then_2_minutes')}
					variant="filled"
					color="green"
					flex={1}
				>
					{t('processYesUk')}
				</Button>
				<Button
					onClick={() => goToInboxStep('3_0_is_delegate')}
					variant="light"
					color="gray"
					flex={1}
				>
					{t('processNoUk')}
				</Button>
			</Group>
			<Button
				onClick={() => goToInboxStep('1_0_is_actionable')}
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
