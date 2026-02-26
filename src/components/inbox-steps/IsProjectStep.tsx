import { Button, Group, Stack, Text } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep } from '@/store/inboxStepper'

export function IsProjectStep() {
	const { t } = useTranslation()
	return (
		<Stack gap="md">
			<Text size="md" fw={500}>
				{t('processQ4')}
			</Text>
			<Group gap="sm">
				<Button
					onClick={() => goToInboxStep('4_1_project')}
					variant="filled"
					color="blue"
					flex={1}
				>
					{t('processYesUk')}
				</Button>
				<Button
					onClick={() => goToInboxStep('5_0_describe_task')}
					variant="light"
					color="gray"
					flex={1}
				>
					{t('processNoUk')}
				</Button>
			</Group>
			<Button
				onClick={() => goToInboxStep('3_0_is_delegate')}
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
