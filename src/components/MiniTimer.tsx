import { Tooltip } from '@mantine/core'
import { IconMaximize } from '@tabler/icons-react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useTimerActions, useTimerState } from '@/store'
import { useTaskById } from '@/store/taskStore'
import { useTheme } from '@/theme'

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m}:${s.toString().padStart(2, '0')}`
}

function createTimerFavicon(progress: number): string {
	const canvas = document.createElement('canvas')
	canvas.width = 32
	canvas.height = 32
	const ctx = canvas.getContext('2d')!

	// Track
	ctx.fillStyle = '#d3f9d8'
	ctx.beginPath()
	ctx.arc(16, 16, 15, 0, Math.PI * 2)
	ctx.fill()

	// Progress pie (remaining)
	const color = progress < 0.15 ? '#fa5252' : '#2f9e44'
	ctx.fillStyle = color
	ctx.beginPath()
	ctx.moveTo(16, 16)
	ctx.arc(16, 16, 15, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2)
	ctx.closePath()
	ctx.fill()

	// Center cutout
	ctx.fillStyle = '#fff'
	ctx.beginPath()
	ctx.arc(16, 16, 7, 0, Math.PI * 2)
	ctx.fill()

	return canvas.toDataURL()
}

export function MiniTimer() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const routerState = useRouterState()
	const { remainingSeconds, totalSeconds, isRunning, isExpired, focusedTaskId } = useTimerState()
	const actions = useTimerActions()
	const task = useTaskById(focusedTaskId)
	const { colorScheme } = useTheme()
	const isDark = colorScheme === 'dark'

	// Save originals once on mount
	const originalTitle = useRef(document.title)
	const originalFavicon = useRef<string | null>(null)
	useEffect(() => {
		const el = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
		if (el) originalFavicon.current = el.getAttribute('href')
	}, [])

	// Tab title + favicon
	useEffect(() => {
		const faviconEl = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
		const isIdle = !isRunning && remainingSeconds === totalSeconds
		if (focusedTaskId && task && !isIdle) {
			document.title = `${formatTime(remainingSeconds)} · ${task.title}`
			if (faviconEl) {
				faviconEl.href = createTimerFavicon(
					totalSeconds > 0 ? remainingSeconds / totalSeconds : 0,
				)
			}
		} else {
			document.title = originalTitle.current
			if (faviconEl && originalFavicon.current) faviconEl.setAttribute('href', originalFavicon.current)
		}
	}, [remainingSeconds, totalSeconds, isRunning, focusedTaskId, task])

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
					background: isDark ? 'var(--mantine-color-green-9)' : 'var(--mantine-color-green-3)',
					borderColor: isDark ? 'var(--mantine-color-green-7)' : 'var(--mantine-color-green-5)',
					color: isDark ? 'var(--mantine-color-green-2)' : 'var(--mantine-color-green-9)',
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
