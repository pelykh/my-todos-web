import { useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'

import { type TaskFilters } from '@/types'

import {
	type DurationStep,
	type FilterActions,
	filterStore,
} from './filterStore'

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
