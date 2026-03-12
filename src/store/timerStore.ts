import { useEffect, useState } from 'react'
import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Task } from '@/types'

const DEFAULT_DURATION_SECONDS = 25 * 60

export type TimerActions = {
	startTimer: (task: Task) => void
	pauseTimer: () => void
	resumeTimer: () => void
	resetTimer: () => void
	setRemainingSeconds: (seconds: number) => void
	setFocusedTaskId: (id: string | null) => void
}

export type TimerState = {
	focusedTaskId: string | null
	isRunning: boolean
	totalSeconds: number
	remainingAtStart: number
	startedAt: string | null
	actions: TimerActions
}

function computeRemaining(remainingAtStart: number, startedAt: string | null): number {
	if (startedAt === null) return remainingAtStart
	const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
	return Math.max(0, remainingAtStart - elapsed)
}

export const timerStore = createStore<TimerState>()(
	persist(
		(set, get) => ({
			focusedTaskId: null,
			isRunning: false,
			totalSeconds: DEFAULT_DURATION_SECONDS,
			remainingAtStart: DEFAULT_DURATION_SECONDS,
			startedAt: null,
			actions: {
				startTimer(task) {
					const total = (task.estimatedMinutes ?? 25) * 60
					set({
						focusedTaskId: task.id,
						totalSeconds: total,
						remainingAtStart: total,
						startedAt: new Date().toISOString(),
						isRunning: true,
					})
				},
				pauseTimer() {
					const { remainingAtStart, startedAt } = get()
					set({
						remainingAtStart: computeRemaining(remainingAtStart, startedAt),
						startedAt: null,
						isRunning: false,
					})
				},
				resumeTimer() {
					set({
						startedAt: new Date().toISOString(),
						isRunning: true,
					})
				},
				resetTimer() {
					const { totalSeconds } = get()
					set({
						remainingAtStart: totalSeconds,
						startedAt: null,
						isRunning: false,
					})
				},
				setRemainingSeconds(seconds) {
					const { isRunning } = get()
					set({
						remainingAtStart: seconds,
						startedAt: isRunning ? new Date().toISOString() : null,
					})
				},
				setFocusedTaskId(id) {
					set({ focusedTaskId: id })
				},
			},
		}),
		{
			name: 'timer',
			partialize: (s) => ({
				focusedTaskId: s.focusedTaskId,
				isRunning: s.isRunning,
				totalSeconds: s.totalSeconds,
				remainingAtStart: s.remainingAtStart,
				startedAt: s.startedAt,
			}),
		},
	),
)

export function useTimerState(): {
	remainingSeconds: number
	totalSeconds: number
	isRunning: boolean
	isExpired: boolean
	focusedTaskId: string | null
} {
	const isRunning = useStore(timerStore, (s) => s.isRunning)
	const totalSeconds = useStore(timerStore, (s) => s.totalSeconds)
	const focusedTaskId = useStore(timerStore, (s) => s.focusedTaskId)
	const remainingAtStart = useStore(timerStore, (s) => s.remainingAtStart)
	const startedAt = useStore(timerStore, (s) => s.startedAt)

	const [, tick] = useState(0)

	useEffect(() => {
		if (!isRunning) return
		const id = setInterval(() => tick((n) => n + 1), 500)
		return () => clearInterval(id)
	}, [isRunning])

	const remainingSeconds = computeRemaining(remainingAtStart, startedAt)

	return {
		remainingSeconds,
		totalSeconds,
		isRunning,
		isExpired: isRunning && remainingSeconds === 0,
		focusedTaskId,
	}
}

export function useTimerActions(): TimerActions {
	return useStore(timerStore, (s) => s.actions)
}
