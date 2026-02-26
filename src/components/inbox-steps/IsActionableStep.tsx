import { Button, Group, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import { goToInboxStep } from '@/store/inboxStepper'

export function IsActionableStep() {
	const { t } = useTranslation()
	return (
		<Stack gap="md">
			<Text size="md" fw={500}>
				{t('processQ1')}
			</Text>
			<Group gap="sm">
				<Button
					onClick={() => goToInboxStep('2_0_is_less_then_2_minutes')}
					variant="filled"
					color="blue"
					flex={1}
				>
					{t('processYesUk')}
				</Button>
				<Button
					onClick={() => goToInboxStep('1_1_not_action')}
					variant="light"
					color="gray"
					flex={1}
				>
					{t('processNoUk')}
				</Button>
			</Group>
		</Stack>
	)
}
