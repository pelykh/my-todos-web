import { useStore } from 'zustand'

import { useXpActions, xpStore } from '@/store/xp'

export function XpDebugButtons() {
	const { addXp, minusXp } = useXpActions()
	const currentXp = useStore(xpStore, (s) => s.currentXp)
	const nextXp = useStore(xpStore, (s) => s.nextXp)

	return (
		<div className="flex items-center justify-center gap-2 mb-1 text-xs font-mono">
			<button
				type="button"
				className="px-2 py-0.5 rounded bg-red-200 dark:bg-red-900 hover:opacity-80"
				onClick={() => minusXp(10)}
			>
				-10 XP
			</button>
			<span className="text-[var(--mantine-color-dimmed)]">
				{currentXp}
				{nextXp !== currentXp && ` → ${nextXp}`}
			</span>
			<button
				type="button"
				className="px-2 py-0.5 rounded bg-lime-200 dark:bg-lime-900 hover:opacity-80"
				onClick={() => addXp(10)}
			>
				+10 XP
			</button>
		</div>
	)
}
