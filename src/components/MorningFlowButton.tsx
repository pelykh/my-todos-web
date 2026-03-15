import { Button } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { isMorningFlowCompletedToday } from '@/store/morningFlowStepper'

export function MorningFlowButton() {
	const { t } = useTranslation()

	if (isMorningFlowCompletedToday()) return null

	return (
		<Button
			component={Link}
			to="/morning-flow"
			variant="light"
			color="teal"
			size="sm"
			radius="md"
		>
			{t('morningFlow')}
		</Button>
	)
}
