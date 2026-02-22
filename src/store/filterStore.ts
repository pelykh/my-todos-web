import { createStore } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Context } from '@/types'

// Duration steps: null means "no filter"
// Values represent upper-bound minutes
export const DURATION_STEPS = [null, 5, 15, 30, 45, 60, 120] as const
export type DurationStep = (typeof DURATION_STEPS)[number]

export type FilterState = {
  context: Context | null
  todayOnly: boolean
  maxMinutes: DurationStep
}

export type FilterActions = {
  setContext: (context: Context | null) => void
  toggleToday: () => void
  activateToday: () => void
  setMaxMinutes: (step: DurationStep) => void
  clearAll: () => void
}

export type FilterStore = FilterState & { actions: FilterActions }

const INITIAL: FilterState = {
  context: null,
  todayOnly: false,
  maxMinutes: null,
}

export const filterStore = createStore<FilterStore>()(
  persist(
    (set) => ({
      ...INITIAL,

      actions: {
        setContext: (context) => set({ context }),
        toggleToday: () => set((s) => ({ todayOnly: !s.todayOnly })),
        activateToday: () => set({ ...INITIAL, todayOnly: true }),
        setMaxMinutes: (maxMinutes) => set({ maxMinutes }),
        clearAll: () => set(INITIAL),
      },
    }),
    {
      name: 'task_filters',
      // don't persist actions
      partialize: (s) => ({
        context: s.context,
        todayOnly: s.todayOnly,
        maxMinutes: s.maxMinutes,
      }),
    },
  ),
)
