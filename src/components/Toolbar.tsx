import {
	Box,
	Button,
	ButtonGroup,
	Group,
	Slider,
	Stack,
	Text,
} from '@mantine/core'
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
import { useTheme } from '@/theme'
import type { Context } from '@/types'

import { XpBar } from './XpBar'

const today = new Date().toISOString().slice(0, 10)

const CONTEXT_KEYS: { value: Context; key: string }[] = [
	{ value: 'deep_work', key: 'context.deep_work' },
	{ value: 'admin', key: 'context.admin' },
	{ value: 'home', key: 'context.home' },
	{ value: 'agenda', key: 'context.agenda' },
]

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
	if (step === undefined) return SLIDER_STEPS.length - 1
	return SLIDER_STEPS.indexOf(step)
}

export function Toolbar() {
	const { colorScheme } = useTheme()
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
		<Box
			style={{
				position: 'fixed',
				bottom: 24,
				left: '50%',
				transform: 'translateX(-50%)',
				zIndex: 100,
				width: 'fit-content',
			}}
		>
			<XpBar value={35} />
			<Box
				p={0}
				style={(theme) => ({
					background: 'var(--mantine-color-body)',
					borderRadius: theme.radius.sm,
          boxShadow: theme.shadows.lg,
				})}
			>
				<Stack gap="0">
          {/* Row 1: context buttons + today star */}
					<ButtonGroup className="[&_button]:rounded-bl-none! [&_button]:rounded-br-none!">
						{CONTEXT_KEYS.map((ctx) => (
							<Button
								key={ctx.value}
                variant={context === ctx.value ? 'filled' : 'default'}
                color='blue'
								onClick={() =>
									setContext(context === ctx.value ? null : ctx.value)
								}
							>
								{t(ctx.key)}
							</Button>
						))}
						<Button
							variant={todayOnly ? 'filled' : 'default'}
							color="yellow"
							disabled={!hasTodayTasks || allTodayDone}
							onClick={handleStarClick}
							aria-label={t('ariaToday')}
							px={12}
						>
							<Star size={14} fill={todayOnly ? 'currentColor' : 'none'} />
						</Button>
					</ButtonGroup>

					{/* Row 2: duration slider */}
					<Group gap="md" align="center" className='h-6 px-1.5 border border-gray-300 border-t-0 rounded-b-sm!'>
						<Slider
							style={{ flex: 1 }}
							min={0}
							max={SLIDER_STEPS.length - 1}
							step={1}
							value={sliderIndex}
              onChange={handleSlider}
							label={(value) => t(DURATION_KEYS[SLIDER_STEPS[value]])}
							thumbLabel={t('ariaDurationFilter')}
							thumbChildren={<IconGripHorizontal size={16} stroke={1.5} />}
							marks={SLIDER_STEPS.map((step, i) => ({ value: i }))}
							classNames={{
								thumb:
									'!w-7 !h-[25px] !rounded-xs !border !border-[var(--mantine-color-default-border)] !bg-[var(--mantine-color-body)] !text-[var(--mantine-color-gray-5)]',

						}}
						/>
						{/*<Text
							size="xs"
							w={36}
							ta="right"
							c={maxMinutes ? 'blue' : 'dimmed'}
						>
							{maxMinutes ? t(DURATION_KEYS[maxMinutes]) : t('duration.any')}
						</Text>*/}
					</Group>
				</Stack>
			</Box>
		</Box>
	)
}
