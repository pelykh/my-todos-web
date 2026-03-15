
import { useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'

import type { TaskFilters } from '@/types'

import {
    type DurationStep,
    type FilterActions,
    filterStore,
} from './filterStore'

export { createStepperStore } from './stepper'
export type { StepComponentProps, StepDef, StepperActions, StepperState } from './stepper'

export {
	inboxStepperStore,
	goToInboxStep,
	patchInboxState,
	resetInboxStepper,
	useInboxCurrentStep,
	useInboxState,
	useInboxActions,
} from './inboxStepper'
export type { InboxStepKey, InboxState } from './inboxStepper'

export {
	morningFlowStepperStore,
	goToMorningFlowStep,
	patchMorningFlowState,
	resetMorningFlowStepper,
	useMorningFlowCurrentStep,
	useMorningFlowState,
	useMorningFlowActions,
	isMorningFlowCompletedToday,
	markMorningFlowCompleted,
} from './morningFlowStepper'
export type { MorningFlowStepKey, MorningFlowState } from './morningFlowStepper'


// ── Filter store hooks ────────────────────────────────────────────────────────

export function useFilters(): TaskFilters {
	return useStore(
		filterStore,
		useShallow((s) => s.filters),
	)
}

export function useFilterActions(): FilterActions {
	return useStore(filterStore, (s) => s.actions)
}

export { DURATION_STEPS } from './filterStore'
export type { DurationStep, FilterActions }

export {
	timerStore,
	useTimerState,
	useTimerActions,
} from './timerStore'
export type { TimerActions, TimerState } from './timerStore'

