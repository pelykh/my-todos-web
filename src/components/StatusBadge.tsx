import { Badge } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import type { TaskStatus } from '@/types'

const STATUS_COLORS: Record<TaskStatus, string> = {
	inbox: 'gray',
	next_action: 'green',
	waiting_for: 'yellow',
	someday: 'cyan',
	backlog: 'indigo',
	done: 'gray',
	deleted: 'red',
}

interface StatusBadgeProps {
	status: TaskStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
	const { t } = useTranslation()

	return (
		<Badge
			variant="light"
			color={STATUS_COLORS[status]}
			size="md"
		>
			{t(`status.${status}`)}
		</Badge>
	)
}
