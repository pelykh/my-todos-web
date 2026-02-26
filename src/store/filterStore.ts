import { createStore } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Context, TaskFilters } from '@/types'

// Duration steps: null means "no filter"
// Values represent upper-bound minutes
export const DURATION_STEPS = [undefined, 5, 15, 30, 45, 60, 120] as const
export type DurationStep = (typeof DURATION_STEPS)[number]

export type FilterActions = {
	setContext: (context: Context | null) => void
	toggleToday: () => void
	activateToday: () => void
	setMaxMinutes: (step: DurationStep) => void
	clearAll: () => void
}

export type FilterStore = {
	filters: TaskFilters
	actions: FilterActions
}

const INITIAL_FILTERS: TaskFilters = {}

export const filterStore = createStore<FilterStore>()(
	persist(
		(set) => ({
			filters: INITIAL_FILTERS,

			actions: {
				setContext: (context) =>
					set((s) => ({
						filters: { ...s.filters, context: context ?? undefined },
					})),
				toggleToday: () =>
					set((s) => ({
						filters: { ...s.filters, isImportant: !s.filters.isImportant },
					})),
				activateToday: () => set({ filters: { isImportant: true } }),
				setMaxMinutes: (maxMinutes) =>
					set((s) => ({
						filters: { ...s.filters, maxEstimatedMinutes: maxMinutes },
					})),
				clearAll: () => set({ filters: INITIAL_FILTERS }),
			},
		}),
		{
			name: 'task_filters',
			partialize: (s) => ({ filters: s.filters }),
		},
	),
)
