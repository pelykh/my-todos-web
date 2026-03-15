import {
	ActionIcon,
	Container,
	Group,
	List,
	Loader,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ShortcutButton } from '@/components/ShortcutButton'
import { TaskListItem } from '@/components/TaskListItem'
import {
	goToMorningFlowStep,
	markMorningFlowCompleted,
	resetMorningFlowStepper,
	useMorningFlowActions,
	useMorningFlowCurrentStep,
} from '@/store/morningFlowStepper'
import { useFilteredTasks } from '@/store/taskStore'

function isWeekend() {
	const day = new Date().getDay()
	return day === 0 || day === 6
}

export const Route = createFileRoute('/morning-flow')({
	component: MorningFlow,
})

const NOTION_URL =
	'https://www.notion.so/248f0fc49d778067a0bae5bbde804e22?v=248f0fc49d778061a9f9000c1231ae13a'

function MorningFlow() {
	const { t } = useTranslation()
	const currentStep = useMorningFlowCurrentStep()
	const { goNextStep, goPreviousStep } = useMorningFlowActions()
	const navigate = useNavigate()

	function finish() {
		markMorningFlowCompleted()
		resetMorningFlowStepper()
		navigate({ to: '/' })
		toast.success(t('morningFlow.completedToast'))
	}

	return (
		<>
			<Group style={{ position: 'fixed', top: 16, left: 16, zIndex: 200 }}>
				<ActionIcon
					component={Link}
					to="/"
					variant="default"
					size="lg"
					radius="md"
					aria-label={t('back')}
					onClick={() => resetMorningFlowStepper()}
				>
					<ArrowLeft size={18} />
				</ActionIcon>
			</Group>

			<Container size="sm" py="xl">
				<Stack gap="xl" mt={60}>
					{currentStep === 'good_morning' && (
						<GoodMorningStep onNext={goNextStep} />
					)}
					{currentStep === 'notion' && (
						<NotionStep onNext={isWeekend() ? () => goToMorningFlowStep('waiting_for') : goNextStep} />
					)}
					{currentStep === 'mail' && (
						<MailStep onNext={goNextStep} onBack={goPreviousStep} />
					)}
					{currentStep === 'messengers' && (
						<MessengersStep onNext={goNextStep} onBack={goPreviousStep} />
					)}
					{currentStep === 'waiting_for' && (
						<WaitingForStep onDone={finish} onBack={isWeekend() ? () => goToMorningFlowStep('notion') : goPreviousStep} />
					)}
				</Stack>
			</Container>
		</>
	)
}

// ── Step 1: Good Morning ──────────────────────────────────────────────────────

function GoodMorningStep({ onNext }: { onNext: () => void }) {
	const { t } = useTranslation()
	return (
		<Stack gap="md" align="center">
			<Title order={2} ta="center">
				{t('morningFlow.goodMorning')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('morningFlow.goodMorningSubtitle')}
			</Text>
			<List spacing="xs" size="md" center icon={<span>–</span>}>
				<List.Item>{t('morningFlow.brushTeeth')}</List.Item>
				<List.Item>{t('morningFlow.weigh')}</List.Item>
				<List.Item>{t('morningFlow.stretch')}</List.Item>
				<List.Item>{t('morningFlow.breakfast')}</List.Item>
				<List.Item>{t('morningFlow.teaOutside')}</List.Item>
			</List>
			<ShortcutButton shortcut="1" onClick={onNext} variant="filled" color="blue" w={200}>
				{t('morningFlow.next')}
			</ShortcutButton>
		</Stack>
	)
}

// ── Step 2: Notion (auto-advance) ─────────────────────────────────────────────

function NotionStep({ onNext }: { onNext: () => void }) {
	const { t } = useTranslation()

	useEffect(() => {
		window.open(NOTION_URL, '_blank')
		const timer = setTimeout(onNext, 3000)
		return () => clearTimeout(timer)
	}, [onNext])

	return (
		<Stack gap="md" align="center">
			<Loader size="md" />
			<Text size="lg" fw={500} ta="center">
				{t('morningFlow.notionOpened')}
			</Text>
			<ShortcutButton shortcut="1" onClick={onNext} variant="light" color="gray" w={200}>
				{t('morningFlow.skip')}
			</ShortcutButton>
		</Stack>
	)
}

// ── Step 3: Mail ──────────────────────────────────────────────────────────────

function MailStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	return (
		<Stack gap="md" align="center">
			<Title order={2} ta="center">
				{t('morningFlow.mail')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('morningFlow.mailSubtitle')}
			</Text>
			<Group gap="sm">
				<ShortcutButton shortcut="1" onClick={onNext} variant="filled" color="blue" w={120}>
					{t('morningFlow.next')}
        </ShortcutButton>
        <ShortcutButton shortcut="2" onClick={onBack} variant="light" color="gray" w={120}>
					{t('morningFlow.back')}
				</ShortcutButton>
			</Group>
		</Stack>
	)
}

// ── Step 4: Messengers ────────────────────────────────────────────────────────

function MessengersStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	return (
		<Stack gap="md" align="center">
			<Title order={2} ta="center">
				{t('morningFlow.messengers')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('morningFlow.messengersSubtitle')}
			</Text>
			<Group gap="sm">
				<ShortcutButton shortcut="1" onClick={onNext} variant="filled" color="blue" w={120}>
					{t('morningFlow.next')}
        </ShortcutButton>
        <ShortcutButton shortcut="2" onClick={onBack} variant="light" color="gray" w={120}>
					{t('morningFlow.back')}
				</ShortcutButton>
			</Group>
		</Stack>
	)
}

// ── Step 5: Waiting For ───────────────────────────────────────────────────────

function WaitingForStep({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	const tasks = useFilteredTasks({ status: 'waiting_for' })

	const sorted = useMemo(
		() =>
			[...tasks].sort((a, b) => {
				const aMs = a.waitingSince ? new Date(a.waitingSince).getTime() : Date.now()
				const bMs = b.waitingSince ? new Date(b.waitingSince).getTime() : Date.now()
				return aMs - bMs
			}),
		[tasks],
	)

	return (
		<Stack gap="md">
			<Title order={2} ta="center">
				{t('morningFlow.waitingFor')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('morningFlow.waitingForSubtitle')}
			</Text>

			<Stack gap={0}>
				{sorted.map((task) => (
					<TaskListItem
						key={task.id}
						taskId={task.id}
						displayMeta={['notes', 'waiting_since']}
						href={`/task/${task.id}`}
					/>
				))}
				{sorted.length === 0 && (
					<Text c="dimmed" ta="center" size="sm">
						{t('waitingForEmpty')}
					</Text>
				)}
			</Stack>

			<Group gap="sm" justify="center">
				<ShortcutButton shortcut="1" onClick={onDone} variant="filled" color="green" w={120}>
					{t('morningFlow.done')}
        </ShortcutButton>
        <ShortcutButton shortcut="2" onClick={onBack} variant="light" color="gray" w={120}>
					{t('morningFlow.back')}
				</ShortcutButton>
			</Group>
		</Stack>
	)
}
