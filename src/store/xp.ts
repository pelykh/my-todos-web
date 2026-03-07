import { useEffect, useRef } from 'react'
import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'

export type XpActions = {
	addXp: (amount: number) => void
	minusXp: (amount: number) => void
	setCurrentXp: (xp: number) => void
	commitCurrentXp: (xp: number) => void
}

export type XpState = {
	currentXp: number
	nextXp: number
	actions: XpActions
}

export const xpStore = createStore<XpState>()(
	persist(
		(set) => ({
			currentXp: 0,
			nextXp: 0,
			actions: {
				addXp(amount) {
					set((s) => ({ nextXp: s.nextXp + amount }))
				},
				minusXp(amount) {
					set((s) => ({ nextXp: Math.max(0, s.nextXp - amount) }))
				},
				setCurrentXp(xp) {
					set({ currentXp: xp, nextXp: xp })
				},
				commitCurrentXp(xp) {
					set({ currentXp: xp })
				},
			},
		}),
		{
			name: 'xp-store',
			partialize: (s) => ({ currentXp: s.currentXp, nextXp: s.nextXp }),
		},
	),
)

// XP required to advance from level N to N+1: floor(50 * N^1.5)
// Level 1→2:  50 XP  (~5 tasks)
// Level 2→3: 141 XP  (~14 tasks)
// Level 3→4: 260 XP  (~26 tasks)
// Level 4→5: 400 XP  (~40 tasks)
export function getXpLevel(xp: number): number {
	let level = 1
	let accumulated = 0
	while (true) {
		accumulated += Math.floor(50 * Math.pow(level, 1.5))
		if (xp < accumulated) return level
		level++
	}
}

function getLevelStartXp(level: number): number {
	let accumulated = 0
	for (let i = 1; i < level; i++) {
		accumulated += Math.floor(50 * Math.pow(i, 1.5))
	}
	return accumulated
}

export function getXpLevelProgress(xp: number): number {
	const level = getXpLevel(xp)
	const currentLevelXp = getLevelStartXp(level)
	const nextLevelXp = currentLevelXp + Math.floor(50 * Math.pow(level, 1.5))
	return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
}

export const ADD_XP_VALUES = {
	taskDone: 10,
} as const

export const MINUS_XP_VALUES = {
	taskRestored: 10,
} as const

export function useIsPendingXpUpdate(): boolean {
	return useStore(xpStore, (s) => s.currentXp !== s.nextXp)
}

export function useCurrentXpLevel(): number {
	return useStore(xpStore, (s) => getXpLevel(s.currentXp))
}

// ANIMATION_DURATION should match the CSS transition duration on the XP bar
const ANIMATION_DURATION = 600

export function useXpLevelProgress({ onLevelUp }: { onLevelUp?: () => void } = {}): number {
	const isPending = useIsPendingXpUpdate()
	const progress = useStore(xpStore, (s) => getXpLevelProgress(s.nextXp))
	const onLevelUpRef = useRef(onLevelUp)
	onLevelUpRef.current = onLevelUp

	useEffect(() => {
		if (!isPending) return

		let timer: ReturnType<typeof setTimeout>

		function processNext() {
			const { currentXp, nextXp, actions } = xpStore.getState()
			const currentLevel = getXpLevel(currentXp)
			const nextLevel = getXpLevel(nextXp)

			if (nextLevel > currentLevel) {
				// Commit to level boundary immediately so the bar animates to 100%
				actions.commitCurrentXp(getLevelStartXp(currentLevel + 1))
				// After animation completes, fire onLevelUp and continue to next level
				timer = setTimeout(() => {
					onLevelUpRef.current?.()
					processNext()
				}, ANIMATION_DURATION)
			} else {
				// Same level — commit final value immediately so bar animates to target
				actions.commitCurrentXp(nextXp)
				// After animation completes, clear pending state
				timer = setTimeout(() => {
					actions.setCurrentXp(nextXp)
				}, ANIMATION_DURATION)
			}
		}

		processNext()

		return () => clearTimeout(timer)
	}, [isPending])

	return progress
}

export function useXpActions(): XpActions {
	return useStore(xpStore, (s) => s.actions)
}
