import { ActionIcon, Box, Group, Slider, Stack, Text } from '@mantine/core'
import {
	IconBrain,
	IconBriefcase,
	IconCalendarEvent,
	IconGripHorizontal,
	IconHome,
} from '@tabler/icons-react'
import { Star } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { DurationStep } from '@/store'
import { DURATION_STEPS, useFilterActions, useFilters } from '@/store'
import { useFilteredTasks } from '@/store/taskStore'
import type { Context } from '@/types'

const today = new Date().toISOString().slice(0, 10)

const CONTEXT_ICONS: {
	value: Context
	key: string
	Icon: React.FC<{ size?: number }>
}[] = [
	{ value: 'deep_work', key: 'context.deep_work', Icon: IconBrain },
	{ value: 'admin', key: 'context.admin', Icon: IconBriefcase },
	{ value: 'home', key: 'context.home', Icon: IconHome },
	{ value: 'agenda', key: 'context.agenda', Icon: IconCalendarEvent },
]

const DURATION_KEYS: Record<number, string> = {
	5: 'duration.lt5',
	15: 'duration.lt15',
	30: 'duration.lt30',
	45: 'duration.lt45',
	60: 'duration.lt1h',
	120: 'duration.lt2h',
}

// slider index ↔ DurationStep value
// 0..<5m>, 1=<15m>, ..., 4=<2h>, 5=Any (null)
const SLIDER_STEPS = DURATION_STEPS.filter((s) => s !== undefined) as number[]

function sliderIndexToStep(index: number): DurationStep {
	return SLIDER_STEPS[index] as DurationStep
}

function stepToSliderIndex(step: DurationStep): number {
	if (step === undefined) return SLIDER_STEPS.length
	return SLIDER_STEPS.indexOf(step)
}

export function Toolbar() {
	const { t } = useTranslation()
	const { context, isImportant: todayOnly, maxEstimatedMinutes } = useFilters()
	const maxMinutes = maxEstimatedMinutes as DurationStep
	const { setContext, setMaxMinutes, activateToday, clearAll, toggleToday } =
		useFilterActions()

	const allTasks = useFilteredTasks()
	const todayTasks = allTasks.filter(
		(t) =>
			t.scheduledDate?.slice(0, 10) === today ||
			t.dueDate?.slice(0, 10) === today,
	)
	const hasTodayTasks = todayTasks.length > 0
	const allTodayDone =
		hasTodayTasks && todayTasks.every((t) => t.status === 'done')

	useEffect(() => {
		if (todayOnly && (!hasTodayTasks || allTodayDone)) {
			toggleToday()
		}
	}, [todayOnly, hasTodayTasks, allTodayDone])

	const sliderIndex = stepToSliderIndex(maxMinutes)

	function handleSlider(value: number) {
		setMaxMinutes(sliderIndexToStep(value))
	}

	function handleStarClick() {
		if (todayOnly) {
			clearAll()
		} else {
			activateToday()
		}
	}

	return (
		<div className="fixed bottom-0 left-0 right-0 z-[100] sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-fit">
			<Box
				px="md"
				pt="md"
				pb="md"
				className="rounded-t-2xl sm:rounded-b-2xl"
				style={(theme) => ({
					background: 'var(--mantine-color-body)',
					boxShadow: theme.shadows.lg,
					paddingBottom: 'calc(var(--mantine-spacing-md) + env(safe-area-inset-bottom, 0px))',
				})}
			>
				<Stack gap="sm">
					{/* Row 1: context icon buttons + today star */}
					<Group gap="xs" justify="center">
						<Group gap="xs">
							{CONTEXT_ICONS.map((ctx) => (
								<ActionIcon
									key={ctx.value}
									size="lg"
									variant={context === ctx.value ? 'filled' : 'subtle'}
									onClick={() =>
										setContext(context === ctx.value ? null : ctx.value)
									}
									aria-label={t(ctx.key)}
								>
									<ctx.Icon size={18} />
								</ActionIcon>
							))}
						</Group>
						<ActionIcon
							size="lg"
							variant={todayOnly ? 'filled' : 'subtle'}
							color="yellow"
							disabled={!hasTodayTasks || allTodayDone}
							onClick={handleStarClick}
							aria-label={t('ariaToday')}
							className={
								!todayOnly && hasTodayTasks && !allTodayDone
									? 'today-pulse'
									: ''
							}
						>
							<Star size={18} fill={todayOnly ? 'currentColor' : 'none'} />
						</ActionIcon>
					</Group>

					{/* Row 2: duration slider */}
					<Group gap="md" align="center">
						<Slider
							style={{ flex: 1, minWidth: 160 }}
							min={0}
							max={SLIDER_STEPS.length}
							step={1}
							value={sliderIndex}
							onChange={handleSlider}
							label={null}
							thumbLabel={t('ariaDurationFilter')}
							thumbChildren={<IconGripHorizontal size={16} stroke={1.5} />}
							marks={[
								...SLIDER_STEPS.map((_, i) => ({ value: i })),
								{ value: SLIDER_STEPS.length },
							]}
							classNames={{
								thumb: '!w-7 !h-[22px] !rounded-sm !border !border-[var(--mantine-color-dark-2)] !bg-[var(--mantine-color-body)] !text-[var(--mantine-color-gray-5)]',
							}}
						/>
						<Text
							size="xs"
							w={36}
							ta="right"
							c={maxMinutes ? 'blue' : 'dimmed'}
						>
							{maxMinutes ? t(DURATION_KEYS[maxMinutes]) : t('duration.any')}
						</Text>
					</Group>
				</Stack>
			</Box>
		</div>
	)
}
