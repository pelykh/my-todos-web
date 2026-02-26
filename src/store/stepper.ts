import type React from 'react'
import { createStore } from 'zustand'

// Props passed to every step component
export type StepComponentProps<TState> = {
  state: TState
  goNextStep: () => void
  goPreviousStep: () => void
  reset: (newState: TState) => void
}

// Definition of a single step: a stable key and the component to render
export type StepDef<TState> = {
  key: string
  component: React.ComponentType<StepComponentProps<TState>>
}

// Actions exposed by the stepper store
export type StepperActions<TState> = {
  goNextStep: () => void
  goPreviousStep: () => void
  goToStep: (key: string) => void
  reset: (newState: TState) => void
}

// Shape of the Zustand state (steps array is closed over, NOT stored here)
export type StepperState<TState> = {
  currentStepKey: string
  state: TState
  actions: StepperActions<TState>
}

/**
 * Factory that creates a vanilla Zustand stepper store.
 *
 * @param steps       Ordered array of step definitions. Closed over — not stored in Zustand.
 * @param initialState  The initial TState value.
 */
export function createStepperStore<TState>(
  steps: StepDef<TState>[],
  initialState: TState,
) {
  return createStore<StepperState<TState>>()((set, get) => ({
    currentStepKey: steps[0]?.key ?? '',
    state: initialState,

    actions: {
      goNextStep() {
        const { currentStepKey } = get()
        const idx = steps.findIndex((s) => s.key === currentStepKey)
        // No-op if already at the last step or key is unknown
        if (idx === -1 || idx >= steps.length - 1) return
        set({ currentStepKey: steps[idx + 1].key })
      },

      goPreviousStep() {
        const { currentStepKey } = get()
        const idx = steps.findIndex((s) => s.key === currentStepKey)
        // No-op if already at the first step or key is unknown
        if (idx <= 0) return
        set({ currentStepKey: steps[idx - 1].key })
      },

      goToStep(key: string) {
        const exists = steps.some((s) => s.key === key)
        // No-op for unknown keys
        if (!exists) return
        set({ currentStepKey: key })
      },

      reset(newState: TState) {
        set({
          currentStepKey: steps[0]?.key ?? '',
          state: newState,
        })
      },
    },
  }))
}
