import { Tooltip } from '@mantine/core'
import { IconMaximize } from '@tabler/icons-react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useTimerActions, useTimerState } from '@/store'
import { useTaskById } from '@/store/taskStore'

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m}:${s.toString().padStart(2, '0')}`
}

export function MiniTimer() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const routerState = useRouterState()
	const { remainingSeconds, isExpired, focusedTaskId } = useTimerState()
	const actions = useTimerActions()
	const task = useTaskById(focusedTaskId)

	// Centralized expiry handler — runs regardless of which page is active
	const hasShownToast = useRef(isExpired && !!focusedTaskId)
	useEffect(() => {
		if (isExpired && focusedTaskId && task && !hasShownToast.current) {
			hasShownToast.current = true
			actions.resetTimer()
			actions.setFocusedTaskId(null)
			toast.success(t('timer.toastDone'), {
				description: task.title,
				action: {
					label: t('timer.toastOpenTask'),
					onClick: () =>
						navigate({ to: '/task/$taskId', params: { taskId: task.id } }),
				},
			})
		}
		if (!isExpired) {
			hasShownToast.current = false
		}
	}, [isExpired, focusedTaskId, task])

	// Hide when no active task or already on the focused task's page
	if (!focusedTaskId || !task) return null
	const onTaskPage = routerState.location.pathname === `/task/${focusedTaskId}`
	if (onTaskPage) return null

	return (
		<Tooltip label={task.title} position="top" withArrow>
			<div
				className="flex cursor-pointer items-center gap-1.5 rounded-md border-2 px-4 py-3 text-md font-bold tabular-nums select-none"
				style={{
					background: 'var(--mantine-color-green-3)',
					borderColor: 'var(--mantine-color-green-5)',
					color: 'var(--mantine-color-green-9)',
				}}
				onClick={() =>
					navigate({ to: '/task/$taskId', params: { taskId: focusedTaskId } })
				}
			>
				{formatTime(remainingSeconds)}
				<IconMaximize size={16} stroke={3} />
			</div>
		</Tooltip>
	)
}
