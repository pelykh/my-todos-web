import { useEffect } from 'react'
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

export function useXpLevelProgress(): { progress: number; level: number } {
	const currentXp = useStore(xpStore, (s) => s.currentXp)
	const nextXp = useStore(xpStore, (s) => s.nextXp)

	useEffect(() => {
		if (currentXp === nextXp) return
		const { actions } = xpStore.getState()
		const startTimer = setTimeout(() => {
			actions.commitCurrentXp(nextXp)
		}, 100)
		const endTimer = setTimeout(() => {
			actions.setCurrentXp(nextXp)
		}, 100 + ANIMATION_DURATION)
		return () => {
			clearTimeout(startTimer)
			clearTimeout(endTimer)
		}
	}, [currentXp, nextXp])

	return {
		progress: getXpLevelProgress(currentXp),
		level: getXpLevel(currentXp),
	}
}

export function useXpActions(): XpActions {
	return useStore(xpStore, (s) => s.actions)
}
