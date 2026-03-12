import { Button } from '@mantine/core'
import { IconPlayerPause, IconPlayerPlay, IconRotate } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useTimerActions, useTimerState } from '@/store'
import type { Task } from '@/types'

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m}:${s.toString().padStart(2, '0')}`
}

export function TimerToolbar({ task }: { task: Task }) {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { remainingSeconds, totalSeconds, isRunning, isExpired, focusedTaskId } =
		useTimerState()
	const actions = useTimerActions()

	const isActive = focusedTaskId === task.id
	const displayTotal = isActive ? totalSeconds : (task.estimatedMinutes ?? 25) * 60
	const displayRemaining = isActive ? remainingSeconds : displayTotal
	const progress = displayTotal > 0 ? displayRemaining / displayTotal : 0

	const barRef = useRef<HTMLDivElement>(null)
	const isDragging = useRef(false)
	const [isDraggingState, setIsDraggingState] = useState(false)

	const isExpiredState = isActive && isExpired
	// Don't fire toast if already expired on mount
	const hasShownToast = useRef(isExpiredState)

	useEffect(() => {
		if (isExpiredState && !hasShownToast.current) {
			hasShownToast.current = true
			toast.success(t('timer.toastDone'), {
				description: task.title,
				action: {
					label: t('timer.toastOpenTask'),
					onClick: () => navigate({ to: '/task/$taskId', params: { taskId: task.id } }),
				},
			})
		}
		if (!isExpiredState) {
			hasShownToast.current = false
		}
	}, [isExpiredState])

	function getSecondsFromPointer(clientX: number): number {
		const rect = barRef.current!.getBoundingClientRect()
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
		return Math.round(ratio * displayTotal)
	}

	function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
		if (!isActive) return
		e.currentTarget.setPointerCapture(e.pointerId)
		isDragging.current = true
		setIsDraggingState(true)
		actions.setRemainingSeconds(getSecondsFromPointer(e.clientX))
	}

	function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
		if (!isDragging.current) return
		actions.setRemainingSeconds(getSecondsFromPointer(e.clientX))
	}

	function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
		isDragging.current = false
		setIsDraggingState(false)
		e.currentTarget.releasePointerCapture(e.pointerId)
	}

	const isPaused = isActive && !isRunning && !isExpiredState
	// Show reset only when the timer has actually elapsed some time
	const showReset = isActive && (isRunning || isExpiredState || remainingSeconds < totalSeconds)

	return (
		<div
			className="overflow-hidden rounded-md border"
			style={{ borderColor: 'var(--mantine-color-default-border)' }}
		>
			{/* Top row */}
			<div className="flex items-stretch">
				{/* Buttons */}
				<div
					className="flex items-center 0 border-r"
					style={{ borderColor: 'var(--mantine-color-default-border)' }}
				>
					{!isExpiredState && (
						<Button
							variant="subtle"
							color="gray"
							px={8}
							radius={0}
							aria-label={isPaused ? t('timer.ariaResume') : t('timer.ariaPlay')}
							onClick={() =>
								isRunning
									? actions.pauseTimer()
									: isPaused
										? actions.resumeTimer()
										: actions.startTimer(task)
							}
						>
							{isRunning ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
						</Button>
					)}
					{showReset && (
						<Button
							variant="subtle"
							color="gray"
							px={8}
							radius={0}
							aria-label={t('timer.ariaReset')}
							onClick={actions.resetTimer}
						>
							<IconRotate size={14} />
						</Button>
					)}
				</div>

				{/* Time display */}
				<div className="flex flex-1 items-center justify-center py-1 text-sm font-bold tabular-nums">
					{isExpiredState ? t('timer.done') : formatTime(displayRemaining)}
				</div>
			</div>

			{/* Progress bar */}
			<div
				ref={barRef}
				className="relative h-6 select-none"
				style={{
					cursor: isActive ? 'ew-resize' : 'default',
					background: 'var(--mantine-color-blue-1)',
				}}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
			>
				{/* Fill */}
				<div
					className="absolute inset-y-0 left-0"
					style={{
						width: `${progress * 100}%`,
						background: 'var(--mantine-color-blue-4)',
						transition: isDraggingState ? 'none' : undefined,
					}}
				/>
				{/* Handle */}
				{isActive && (
					<div
						className="absolute top-0 h-full w-1.5 -translate-x-1/2"
						style={{
							left: `${progress * 100}%`,
							background: 'var(--mantine-color-default-border)',
						}}
					/>
				)}
			</div>
		</div>
	)
}
