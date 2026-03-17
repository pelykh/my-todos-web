import { Button } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { isWeeklyReviewCompletedThisWeek } from '@/store/weeklyReviewStepper'

export function WeeklyReviewButton() {
	const { t } = useTranslation()

	const now = new Date()
	const isFridayAfterNoon = now.getDay() === 5 && now.getHours() >= 12
	if (!isFridayAfterNoon || isWeeklyReviewCompletedThisWeek()) return null

	return (
		<Button
			component={Link}
			to="/weekly-review"
			variant="light"
			color="violet"
			size="sm"
			radius="md"
		>
			{t('weeklyReview')}
		</Button>
	)
}
