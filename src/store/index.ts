import { type TaskFilters } from '@/types'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'
import {
  type DurationStep,
  type FilterActions,
  filterStore,
} from './filterStore'
import { focusedTaskStore } from './focusedTaskStore'


// ── Filter store hooks ────────────────────────────────────────────────────────

export function useFilters(): TaskFilters {
	return useStore(filterStore, useShallow((s) => s.filters))
}

export function useFilterActions(): FilterActions {
	return useStore(filterStore, (s) => s.actions)
}

export { DURATION_STEPS } from './filterStore'
export type { DurationStep, FilterActions }

// ── Focused task store hooks ──────────────────────────────────────────────────

export function useFocusedTaskId() {
	return useStore(focusedTaskStore, (s) => s.focusedTaskId)
}

export function useFocusedTaskActions() {
	return useStore(focusedTaskStore, (s) => s.setFocusedTaskId)
}
