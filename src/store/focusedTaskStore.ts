import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type FocusedTaskState = {
  focusedTaskId: string | null
  setFocusedTaskId: (id: string | null) => void
}

export const focusedTaskStore = create<FocusedTaskState>()(
  persist(
    (set) => ({
      focusedTaskId: null,
      setFocusedTaskId: (id) => set({ focusedTaskId: id }),
    }),
    { name: 'focused-task' },
  ),
)
