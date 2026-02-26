import { useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'

import type { Task } from '@/types'

import { createStepperStore } from './stepper'

// ── Types ─────────────────────────────────────────────────────────────────────

export type InboxStepKey =
	| '1_0_is_actionable'
	| '1_1_not_action'
	| '1_1_1_reference'
	| '2_0_is_less_then_2_minutes'
	| '2_1_less_then_2_minutes'
	| '3_0_is_delegate'
	| '3_1_delegate'
	| '4_0_is_project'
	| '4_1_project'
	| '4_1_1_new_project'
	| '4_1_2_existing_project'
	| '5_0_describe_task'

export type InboxState = {
	task: Task | null
	/** Name typed in for a new project */
	newProjectName: string
	/** ID of an existing project selected by the user */
	selectedProjectId: string | null
}

const INITIAL_STATE: InboxState = {
	task: null,
	newProjectName: '',
	selectedProjectId: null,
}

// ── Store ─────────────────────────────────────────────────────────────────────

// Steps are listed in a logical order; navigation is non-linear via goToStep().
const INBOX_STEPS: { key: InboxStepKey }[] = [
	{ key: '1_0_is_actionable' },
	{ key: '1_1_not_action' },
	{ key: '1_1_1_reference' },
	{ key: '2_0_is_less_then_2_minutes' },
	{ key: '2_1_less_then_2_minutes' },
	{ key: '3_0_is_delegate' },
	{ key: '3_1_delegate' },
	{ key: '4_0_is_project' },
	{ key: '4_1_project' },
	{ key: '4_1_1_new_project' },
	{ key: '4_1_2_existing_project' },
	{ key: '5_0_describe_task' },
]

// Components are rendered in process-inbox.tsx based on currentStepKey,
// so the component field is not used here — cast steps to satisfy the generic.
export const inboxStepperStore = createStepperStore<InboxState>(
	INBOX_STEPS as never,
	INITIAL_STATE,
)

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Patch shared InboxState without changing the current step. */
export function patchInboxState(patch: Partial<InboxState>) {
	inboxStepperStore.setState((s) => ({
		state: { ...s.state, ...patch },
	}))
}

/** Navigate to a step by key (type-safe wrapper). */
export function goToInboxStep(key: InboxStepKey) {
	inboxStepperStore.getState().actions.goToStep(key)
}

/** Reset stepper to step 1 and clear shared state. */
export function resetInboxStepper() {
	inboxStepperStore.getState().actions.reset(INITIAL_STATE)
}

// ── Hooks / selectors ─────────────────────────────────────────────────────────

export function useInboxCurrentStep(): InboxStepKey {
	return useStore(
		inboxStepperStore,
		(s) => s.currentStepKey as InboxStepKey,
	)
}

export function useInboxState(): InboxState {
	return useStore(inboxStepperStore, useShallow((s) => s.state))
}

export function useInboxActions() {
	return useStore(inboxStepperStore, (s) => s.actions)
}
