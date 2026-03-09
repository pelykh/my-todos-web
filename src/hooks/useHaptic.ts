import { useCallback } from 'react'
import { useWebHaptics } from 'web-haptics/react'

import { useSettingsStore } from '@/store/settingsStore'

export function useHaptic() {
  const hapticMode = useSettingsStore((s) => s.hapticMode)
  const { trigger } = useWebHaptics({ debug: hapticMode === 'sound' })

  return useCallback(
    (pattern = 'selection') => {
      if (hapticMode === 'off') return
      void trigger(pattern)
    },
    [hapticMode, trigger],
  )
}
