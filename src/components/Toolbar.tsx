import { Box, Group, Button, Slider, Text, ActionIcon, Stack, ButtonGroup } from '@mantine/core'
import { IconGripHorizontal } from '@tabler/icons-react'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFilters, useFilterActions, DURATION_STEPS } from '@/store'
import type { DurationStep } from '@/store'
import type { Context } from '@/types'
import { useTheme } from '@/theme'
import { useFilteredTasks } from '@/store/taskStore'

const today = new Date().toISOString().slice(0, 10)

const CONTEXT_KEYS: { value: Context; key: string }[] = [
  { value: 'deep_work', key: 'context.deep_work' },
  { value: 'admin', key: 'context.admin' },
  { value: 'home', key: 'context.home' },
  { value: 'agenda', key: 'context.agenda' },
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
  return (SLIDER_STEPS[index]) as DurationStep
}

function stepToSliderIndex(step: DurationStep): number {
  if (step === undefined) return SLIDER_STEPS.length
  return SLIDER_STEPS.indexOf(step)
}

export function Toolbar() {
  const { colorScheme } = useTheme()
  const { t } = useTranslation()
  const { context, isImportant: todayOnly, maxEstimatedMinutes } = useFilters()
  const maxMinutes = (maxEstimatedMinutes) as DurationStep
  const { setContext, setMaxMinutes, activateToday, clearAll } = useFilterActions()

  const allTasks = useFilteredTasks()
  const todayTasks = allTasks.filter(
    (t) => t.scheduledDate?.slice(0, 10) === today || t.dueDate?.slice(0, 10) === today,
  )
  const hasTodayTasks = todayTasks.length > 0
  const allTodayDone = hasTodayTasks && todayTasks.every((t) => t.status === 'done')

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
      <Box
        p="md"
        style={(theme) => ({
          background: 'var(--mantine-color-body)',
          border: `1px solid ${theme.colors.gray[colorScheme === 'dark' ? 7 : 2]}`,
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadows.lg,
        })}
      >
        <Stack gap="sm">
          {/* Row 1: context buttons + today star */}
          <Group gap="xs" justify="center">
            <ButtonGroup>
              {CONTEXT_KEYS.map((ctx) => (
                <Button
                  key={ctx.value}
                  size="xs"
                  variant={context === ctx.value ? 'filled' : 'default'}
                  onClick={() => setContext(context === ctx.value ? null : ctx.value)}
                >
                  {t(ctx.key)}
                </Button>
              ))}
            </ButtonGroup>
            <ActionIcon
              size="md"
              variant={todayOnly ? 'filled' : 'default'}
              color="yellow"
              disabled={!hasTodayTasks || allTodayDone}
              onClick={handleStarClick}
              aria-label={t('ariaToday')}
              className={!todayOnly && hasTodayTasks && !allTodayDone ? 'today-pulse' : ''}
            >
              <Star size={14} fill={todayOnly ? 'currentColor' : 'none'} />
            </ActionIcon>
          </Group>

          {/* Row 2: duration slider */}
          <Group gap="md" align="center">
            <Slider
              style={{ flex: 1 }}
              min={0}
              max={SLIDER_STEPS.length}
              step={1}
              value={sliderIndex}
              onChange={handleSlider}
              label={null}
              thumbLabel={t('ariaDurationFilter')}
              thumbChildren={<IconGripHorizontal size={16} stroke={1.5} />}
              marks={[...SLIDER_STEPS.map((_, i) => ({ value: i })), { value: SLIDER_STEPS.length }]}
              classNames={{
                thumb: '!w-7 !h-[22px] !rounded-sm !border !border-[var(--mantine-color-dark-2)] !bg-[var(--mantine-color-body)] !text-[var(--mantine-color-gray-5)]',
              }}
            />
            <Text size="xs" w={36} ta="right" c={maxMinutes ? 'blue' : 'dimmed'}>
              {maxMinutes ? t(DURATION_KEYS[maxMinutes]) : t('duration.any')}
            </Text>
          </Group>
        </Stack>
      </Box>
    </Box>
  )
}
