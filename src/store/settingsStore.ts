import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type HapticMode = 'off' | 'vibration' | 'sound'

type SettingsStore = {
  hapticMode: HapticMode
  setHapticMode: (mode: HapticMode) => void
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hapticMode: 'sound',
      setHapticMode: (hapticMode) => set({ hapticMode }),
      notificationsEnabled: false,
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    {
      name: 'app_settings',
    },
  ),
)
