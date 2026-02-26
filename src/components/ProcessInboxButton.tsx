import { Button } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { useFilteredTasks } from '@/store/taskStore'

export function ProcessInboxButton() {
	const { t } = useTranslation()
	const inboxTasks = useFilteredTasks({ status: 'inbox' })

	if (inboxTasks.length < 1) return null

	return (
		<Button
			component={Link}
			to="/process-inbox"
			variant="light"
			color="orange"
			size="sm"
			radius="md"
		>
			{t('processInbox')} ({inboxTasks.length})
		</Button>
	)
}
