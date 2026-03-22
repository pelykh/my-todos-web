import { useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'

import { createStepperStore } from './stepper'

// ── Types ─────────────────────────────────────────────────────────────────────

export type WeeklyReviewStepKey =
	| 'process_inbox'
	| 'physical_inbox'
	| 'quick_notes'
	| 'browsers'
	| 'local_files'
	| 'expenses'
	| 'habits'
	| 'photos'
	| 'brain_dump'
	| 'last_week'
	| 'next_week'
	| 'waiting_for'
	| 'next_actions'
	| 'projects_no_next_action'
	| 'projects_stale'
	| 'all_projects'
	| 'horizons'
	| 'someday'
	| 'crazy_ideas'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type WeeklyReviewState = {}

const INITIAL_STATE: WeeklyReviewState = {}

// ── Store ─────────────────────────────────────────────────────────────────────

const WEEKLY_REVIEW_STEPS: { key: WeeklyReviewStepKey }[] = [
	{ key: 'process_inbox' },
	{ key: 'physical_inbox' },
	{ key: 'quick_notes' },
	{ key: 'browsers' },
	{ key: 'local_files' },
	{ key: 'expenses' },
	{ key: 'habits' },
	{ key: 'photos' },
	{ key: 'brain_dump' },
	{ key: 'last_week' },
	{ key: 'next_week' },
	{ key: 'waiting_for' },
	{ key: 'next_actions' },
	{ key: 'projects_no_next_action' },
	{ key: 'projects_stale' },
	{ key: 'all_projects' },
	{ key: 'horizons' },
	{ key: 'someday' },
	{ key: 'crazy_ideas' },
]

export const weeklyReviewStepperStore = createStepperStore<WeeklyReviewState>(
	WEEKLY_REVIEW_STEPS as never,
	INITIAL_STATE,
)

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navigate to a step by key (type-safe wrapper). */
export function goToWeeklyReviewStep(key: WeeklyReviewStepKey) {
	weeklyReviewStepperStore.getState().actions.goToStep(key)
}

/** Reset stepper to step 1, clear shared state, and clear the crazy-ideas timer. */
export function resetWeeklyReviewStepper() {
	localStorage.removeItem(CRAZY_IDEAS_TIMER_KEY)
	weeklyReviewStepperStore.getState().actions.reset(INITIAL_STATE)
}

// ── Hooks / selectors ─────────────────────────────────────────────────────────

export function useWeeklyReviewCurrentStep(): WeeklyReviewStepKey {
	return useStore(
		weeklyReviewStepperStore,
		(s) => s.currentStepKey as WeeklyReviewStepKey,
	)
}

export function useWeeklyReviewState(): WeeklyReviewState {
	return useStore(weeklyReviewStepperStore, useShallow((s) => s.state))
}

export function useWeeklyReviewActions() {
	return useStore(weeklyReviewStepperStore, (s) => s.actions)
}

// ── Crazy ideas timer ─────────────────────────────────────────────────────────

export const CRAZY_IDEAS_TIMER_KEY = 'weeklyReviewCrazyIdeasStartedAt'
export const CRAZY_IDEAS_TOTAL_SECONDS = 900

/** Returns remaining seconds for the crazy-ideas timer, setting start time if not set. */
export function getCrazyIdeasInitialSeconds(): number {
	const stored = localStorage.getItem(CRAZY_IDEAS_TIMER_KEY)
	if (stored) {
		const elapsed = Math.floor((Date.now() - new Date(stored).getTime()) / 1000)
		return Math.max(0, CRAZY_IDEAS_TOTAL_SECONDS - elapsed)
	}
	localStorage.setItem(CRAZY_IDEAS_TIMER_KEY, new Date().toISOString())
	return CRAZY_IDEAS_TOTAL_SECONDS
}

// ── Weekly review completion tracking ────────────────────────────────────────

const WEEKLY_REVIEW_LS_KEY = 'weeklyReviewCompletedAt'

/** Returns the ISO week number for a given date. */
function getISOWeek(date: Date): string {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
	const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
	return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export function isWeeklyReviewCompletedThisWeek(): boolean {
	const stored = localStorage.getItem(WEEKLY_REVIEW_LS_KEY)
	if (!stored) return false
	return getISOWeek(new Date(stored)) === getISOWeek(new Date())
}

export function markWeeklyReviewCompleted(): void {
	localStorage.setItem(WEEKLY_REVIEW_LS_KEY, new Date().toISOString())
	localStorage.removeItem(CRAZY_IDEAS_TIMER_KEY)
}

export function resetWeeklyReviewCompleted(): void {
	localStorage.removeItem(WEEKLY_REVIEW_LS_KEY)
}
