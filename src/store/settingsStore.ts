import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type HapticMode = 'off' | 'vibration' | 'sound'

type SettingsStore = {
  hapticMode: HapticMode
  setHapticMode: (mode: HapticMode) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hapticMode: 'vibration',
      setHapticMode: (hapticMode) => set({ hapticMode }),
    }),
    {
      name: 'app_settings',
    },
  ),
)
