import { useXpLevelProgress } from '@/store/xp'

const SEGMENTS = 10

export function XpBar() {
	const { progress, level } = useXpLevelProgress()


	return (
		<div className="relative flex items-center mb-1">
			<span
				className="absolute left-1/2 -translate-x-1/2 -top-3 text-lg font-bold leading-none text-lime-400 dark:text-lime-500 z-10"
				style={{ WebkitTextStroke: '1px #4d7c0f' }}
			>
				{level}
			</span>
			<div className="relative h-2 w-full rounded-xs overflow-hidden  bg-gray-200 border border-lime-600 dark:border-lime-700">
				<div
					className="absolute inset-y-0 left-0 dark:bg-lime-500 bg-lime-400  transition-all duration-[600ms]"
					style={{ width: `${progress}%` }}
				/>
				{Array.from({ length: SEGMENTS - 1 }).map((_, i) => (
					<div
						key={i}
						className="absolute inset-y-0 w-px bg-lime-600 dark:border-lime-700"
						style={{ left: `${((i + 1) / SEGMENTS) * 100}%` }}
					/>
				))}
			</div>
		</div>
	)
}
