import { useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'

import { createStepperStore } from './stepper'

// ── Types ─────────────────────────────────────────────────────────────────────

export type MorningFlowStepKey =
	| 'good_morning'
	| 'notion'
	| 'mail'
	| 'messengers'
	| 'waiting_for'

export type MorningFlowState = {}

const INITIAL_STATE: MorningFlowState = {}

// ── Store ─────────────────────────────────────────────────────────────────────

const MORNING_FLOW_STEPS: { key: MorningFlowStepKey }[] = [
	{ key: 'good_morning' },
	{ key: 'notion' },
	{ key: 'mail' },
	{ key: 'messengers' },
	{ key: 'waiting_for' },
]

export const morningFlowStepperStore = createStepperStore<MorningFlowState>(
	MORNING_FLOW_STEPS as never,
	INITIAL_STATE,
)

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Patch shared MorningFlowState without changing the current step. */
export function patchMorningFlowState(patch: Partial<MorningFlowState>) {
	morningFlowStepperStore.setState((s) => ({
		state: { ...s.state, ...patch },
	}))
}

/** Navigate to a step by key (type-safe wrapper). */
export function goToMorningFlowStep(key: MorningFlowStepKey) {
	morningFlowStepperStore.getState().actions.goToStep(key)
}

/** Reset stepper to step 1 and clear shared state. */
export function resetMorningFlowStepper() {
	morningFlowStepperStore.getState().actions.reset(INITIAL_STATE)
}

// ── Hooks / selectors ─────────────────────────────────────────────────────────

export function useMorningFlowCurrentStep(): MorningFlowStepKey {
	return useStore(
		morningFlowStepperStore,
		(s) => s.currentStepKey as MorningFlowStepKey,
	)
}

export function useMorningFlowState(): MorningFlowState {
	return useStore(morningFlowStepperStore, useShallow((s) => s.state))
}

export function useMorningFlowActions() {
	return useStore(morningFlowStepperStore, (s) => s.actions)
}

// ── Morning flow completion tracking ──────────────────────────────────────────

const MORNING_FLOW_LS_KEY = 'morningFlowCompletedAt'

export function isMorningFlowCompletedToday(): boolean {
	const stored = localStorage.getItem(MORNING_FLOW_LS_KEY)
	if (!stored) return false
	const storedDate = new Date(stored).toDateString()
	return storedDate === new Date().toDateString()
}

export function markMorningFlowCompleted(): void {
	localStorage.setItem(MORNING_FLOW_LS_KEY, new Date().toISOString())
}
