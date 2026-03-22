import {
	ActionIcon,
	Button,
	Container,
	Group,
	Loader,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CountdownTimer } from '@/components/CountdownTimer'
import { DirectTaskForm } from '@/components/DirectTaskForm'
import { ShortcutButton } from '@/components/ShortcutButton'
import { TaskListItem } from '@/components/TaskListItem'
import { useFilteredTasks } from '@/store/taskStore'
import {
	CRAZY_IDEAS_TOTAL_SECONDS,
	getCrazyIdeasInitialSeconds,
	markWeeklyReviewCompleted,
	resetWeeklyReviewStepper,
	useWeeklyReviewActions,
	useWeeklyReviewCurrentStep,
} from '@/store/weeklyReviewStepper'

export const Route = createFileRoute('/weekly-review')({
	component: WeeklyReview,
})

const RETURN_TO = '/weekly-review'
const TWO_WEEKS_AGO = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
const NOTION_QUICK_NOTES_URL =
	'https://www.notion.so/19ef0fc49d77809e9969cb7cdaa3e6e4?v=1a1f0fc49d7780ad82f5000cbac6716b'
const HABITS_URL = 'https://claude.ai/public/artifacts/971cf97c-ebaa-4224-82ff-b7646081aadc'

function WeeklyReview() {
	const { t } = useTranslation()
	const currentStep = useWeeklyReviewCurrentStep()
	const { goNextStep, goPreviousStep } = useWeeklyReviewActions()
	const navigate = useNavigate()
	const inboxTasks = useFilteredTasks({ status: 'inbox' })

	// Auto-advance from step 1 once inbox is empty (after returning from process-inbox)
	useEffect(() => {
		if (currentStep === 'process_inbox' && inboxTasks.length === 0) {
			goNextStep()
		}
	}, [currentStep, inboxTasks.length, goNextStep])

	function finish() {
		markWeeklyReviewCompleted()
		resetWeeklyReviewStepper()
		navigate({ to: '/' })
		toast.success(t('weeklyReview.completedToast'))
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
					aria-label={t('weeklyReview.back')}
					onClick={() => resetWeeklyReviewStepper()}
				>
					<ArrowLeft size={18} />
				</ActionIcon>
			</Group>

			<Container size="sm" py="xl">
				<Stack gap="xl" mt={60}>
					{currentStep === 'process_inbox' && (
						<ProcessInboxStep />
					)}
					{currentStep === 'physical_inbox' && (
						<StandardStep
							titleKey="weeklyReview.physicalInbox.title"
							subtitleKey="weeklyReview.physicalInbox.subtitle"
							onNext={goNextStep}
							onBack={goPreviousStep}
						/>
					)}
					{currentStep === 'quick_notes' && (
						<QuickNotesStep onNext={goNextStep} onBack={goPreviousStep} />
					)}
					{currentStep === 'browsers' && (
						<StandardStep
							titleKey="weeklyReview.browsers.title"
							subtitleKey="weeklyReview.browsers.subtitle"
							onNext={goNextStep}
							onBack={goPreviousStep}
						/>
					)}
					{currentStep === 'local_files' && (
						<StandardStep
							titleKey="weeklyReview.localFiles.title"
							subtitleKey="weeklyReview.localFiles.subtitle"
							onNext={goNextStep}
							onBack={goPreviousStep}
						/>
					)}
					{currentStep === 'expenses' && (
						<StandardStep
							titleKey="weeklyReview.expenses.title"
							subtitleKey="weeklyReview.expenses.subtitle"
							onNext={goNextStep}
							onBack={goPreviousStep}
						/>
					)}
					{currentStep === 'habits' && (
						<HabitsStep onNext={goNextStep} onBack={goPreviousStep} />
					)}
					{currentStep === 'photos' && (
						<StandardStep
							titleKey="weeklyReview.photos.title"
							subtitleKey="weeklyReview.photos.subtitle"
							onNext={goNextStep}
							onBack={goPreviousStep}
						/>
					)}
					{currentStep === 'brain_dump' && (
						<StandardStep
							titleKey="weeklyReview.brainDump.title"
							subtitleKey="weeklyReview.brainDump.subtitle"
							onNext={goNextStep}
							onBack={goPreviousStep}
						/>
					)}
					{currentStep === 'last_week' && (
						<StandardStep
							titleKey="weeklyReview.lastWeek.title"
							subtitleKey="weeklyReview.lastWeek.subtitle"
							onNext={goNextStep}
							onBack={goPreviousStep}
						/>
					)}
					{currentStep === 'next_week' && (
						<StandardStep
							titleKey="weeklyReview.nextWeek.title"
							subtitleKey="weeklyReview.nextWeek.subtitle"
							onNext={goNextStep}
							onBack={goPreviousStep}
						/>
					)}
					{currentStep === 'waiting_for' && (
						<WaitingForStep onNext={goNextStep} onBack={goPreviousStep} />
					)}
					{currentStep === 'next_actions' && (
						<NextActionsStep onNext={goNextStep} onBack={goPreviousStep} />
					)}
					{currentStep === 'projects_no_next_action' && (
						<ProjectsNoNextActionStep onNext={goNextStep} onBack={goPreviousStep} />
					)}
					{currentStep === 'projects_stale' && (
						<ProjectsStaleStep onNext={goNextStep} onBack={goPreviousStep} />
					)}
					{currentStep === 'all_projects' && (
						<AllProjectsStep onNext={goNextStep} onBack={goPreviousStep} />
					)}
					{currentStep === 'horizons' && (
						<StandardStep
							titleKey="weeklyReview.horizons.title"
							subtitleKey="weeklyReview.horizons.subtitle"
							onNext={goNextStep}
							onBack={goPreviousStep}
						/>
					)}
					{currentStep === 'someday' && (
						<SomedayStep onNext={goNextStep} onBack={goPreviousStep} />
					)}
					{currentStep === 'crazy_ideas' && (
						<CrazyIdeasStep onFinish={finish} onBack={goPreviousStep} />
					)}
				</Stack>
			</Container>
		</>
	)
}

// ── Step 1: Process Inbox ─────────────────────────────────────────────────────

function ProcessInboxStep() {
	const { t } = useTranslation()
	return (
		<Stack gap="md" align="center">
			<Title order={2} ta="center">
				{t('weeklyReview.processInbox.title')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('weeklyReview.processInbox.subtitle')}
			</Text>
			<Button
				component={Link}
				to="/process-inbox"
				search={{ returnTo: RETURN_TO }}
				variant="filled"
				color="blue"
				w={200}
			>
				{t('weeklyReview.openInbox')}
			</Button>
		</Stack>
	)
}

// ── Quick Notes step ──────────────────────────────────────────────────────────

function QuickNotesStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()

	useEffect(() => {
		window.open(NOTION_QUICK_NOTES_URL, '_blank')
		const timer = setTimeout(onNext, 3000)
		return () => clearTimeout(timer)
	}, [onNext])

	return (
		<Stack gap="md" align="center">
			<Loader size="md" />
			<Text size="lg" fw={500} ta="center">
				{t('weeklyReview.quickNotes.opened')}
			</Text>
			<Group gap="sm">
				<ShortcutButton shortcut="1" onClick={onNext} variant="light" color="gray" w={200}>
					{t('weeklyReview.next')}
				</ShortcutButton>
				<ShortcutButton shortcut="2" onClick={onBack} variant="light" color="gray" w={200}>
					{t('weeklyReview.back')}
				</ShortcutButton>
			</Group>
		</Stack>
	)
}

// ── Habits step ───────────────────────────────────────────────────────────────

function HabitsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()

	useEffect(() => {
		window.open(HABITS_URL, '_blank')
		const timer = setTimeout(onNext, 3000)
		return () => clearTimeout(timer)
	}, [onNext])

	return (
		<Stack gap="md" align="center">
			<Loader size="md" />
			<Text size="lg" fw={500} ta="center">
				{t('weeklyReview.habits.opened')}
			</Text>
			<Group gap="sm">
				<ShortcutButton shortcut="1" onClick={onNext} variant="light" color="gray" w={200}>
					{t('weeklyReview.next')}
				</ShortcutButton>
				<ShortcutButton shortcut="2" onClick={onBack} variant="light" color="gray" w={200}>
					{t('weeklyReview.back')}
				</ShortcutButton>
			</Group>
		</Stack>
	)
}

// ── Standard step (title + subtitle + DirectTaskForm + Next/Back) ─────────────

function StandardStep({
	titleKey,
	subtitleKey,
	onNext,
	onBack,
}: {
	titleKey: string
	subtitleKey: string
	onNext: () => void
	onBack: () => void
}) {
	const { t } = useTranslation()
	return (
		<Stack gap="md">
			<Title order={2} ta="center">
				{t(titleKey)}
			</Title>
			<Text c="dimmed" ta="center">
				{t(subtitleKey)}
			</Text>
			<DirectTaskForm returnTo={RETURN_TO} />
			<NavButtons onNext={onNext} onBack={onBack} />
		</Stack>
	)
}

// ── Step 10: Waiting For ──────────────────────────────────────────────────────

function WaitingForStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	const tasks = useFilteredTasks({ status: 'waiting_for' })

	const sorted = useMemo(
		() =>
			[...tasks].sort((a, b) => {
				const aMs = a.waitingSince ? new Date(a.waitingSince).getTime() : Number.MAX_SAFE_INTEGER
				const bMs = b.waitingSince ? new Date(b.waitingSince).getTime() : Number.MAX_SAFE_INTEGER
				return aMs - bMs
			}),
		[tasks],
	)

	return (
		<Stack gap="md">
			<Title order={2} ta="center">
				{t('weeklyReview.waitingFor.title')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('weeklyReview.waitingFor.subtitle')}
			</Text>
			<Stack gap={0}>
				{sorted.map((task) => (
					<TaskListItem
						key={task.id}
						taskId={task.id}
						displayMeta={['notes', 'waiting_since']}
						href={`/task/${task.id}?return_to=${RETURN_TO}`}
					/>
				))}
				{sorted.length === 0 && (
					<Text c="dimmed" ta="center" size="sm">
						{t('waitingForEmpty')}
					</Text>
				)}
			</Stack>
			<DirectTaskForm returnTo={RETURN_TO} />
			<NavButtons onNext={onNext} onBack={onBack} />
		</Stack>
	)
}

// ── Step 11: Next Actions ─────────────────────────────────────────────────────

function NextActionsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	const tasks = useFilteredTasks({ status: 'next_action', isProject: false })

	return (
		<Stack gap="md">
			<Title order={2} ta="center">
				{t('weeklyReview.nextActions.title')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('weeklyReview.nextActions.subtitle')}
			</Text>
			<Stack gap={0}>
				{tasks.map((task) => (
					<TaskListItem
						key={task.id}
						taskId={task.id}
						displayMeta={['project', 'duration']}
						href={`/task/${task.id}?return_to=${RETURN_TO}`}
					/>
				))}
				{tasks.length === 0 && (
					<Text c="dimmed" ta="center" size="sm">
						{t('noTasksEmpty')}
					</Text>
				)}
			</Stack>
			<DirectTaskForm returnTo={RETURN_TO} />
			<NavButtons onNext={onNext} onBack={onBack} />
		</Stack>
	)
}

// ── Step 12: Projects Without Next Actions ────────────────────────────────────

function ProjectsNoNextActionStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	const allProjects = useFilteredTasks({ isProject: true })
	const nextActions = useFilteredTasks({ status: 'next_action', isProject: false })

	const filtered = allProjects.filter(
		(p) =>
			!['done', 'deleted'].includes(p.status) &&
			!nextActions.some((task) => task.projectId === p.id),
	)

	return (
		<Stack gap="md">
			<Title order={2} ta="center">
				{t('weeklyReview.projectsNoNextAction.title')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('weeklyReview.projectsNoNextAction.subtitle')}
			</Text>
			<Stack gap={0}>
				{filtered.map((project) => (
					<TaskListItem
						key={project.id}
						taskId={project.id}
						displayMeta={['area']}
						href={`/project/${project.id}?return_to=${RETURN_TO}`}
					/>
				))}
				{filtered.length === 0 && (
					<Text c="dimmed" ta="center" size="sm">
						{t('weeklyReview.projectsNoNextAction.empty')}
					</Text>
				)}
			</Stack>
			<DirectTaskForm returnTo={RETURN_TO} />
			<NavButtons onNext={onNext} onBack={onBack} />
		</Stack>
	)
}

// ── Step 13: Stale Projects ───────────────────────────────────────────────────

function ProjectsStaleStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	const allProjects = useFilteredTasks({ isProject: true })
	const allTasks = useFilteredTasks({ excludeStatuses: ['deleted'] })

	const filtered = allProjects.filter((p) => {
		if (['done', 'deleted'].includes(p.status)) return false
		const projectTasks = allTasks.filter((t) => t.projectId === p.id)
		const latestUpdate = Math.max(
			new Date(p.updatedAt).getTime(),
			...projectTasks.map((t) => new Date(t.updatedAt).getTime()),
		)
		return latestUpdate < TWO_WEEKS_AGO.getTime()
	})

	return (
		<Stack gap="md">
			<Title order={2} ta="center">
				{t('weeklyReview.projectsStale.title')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('weeklyReview.projectsStale.subtitle')}
			</Text>
			<Stack gap={0}>
				{filtered.map((project) => (
					<TaskListItem
						key={project.id}
						taskId={project.id}
						displayMeta={['area']}
						href={`/project/${project.id}?return_to=${RETURN_TO}`}
					/>
				))}
				{filtered.length === 0 && (
					<Text c="dimmed" ta="center" size="sm">
						{t('weeklyReview.projectsStale.empty')}
					</Text>
				)}
			</Stack>
			<DirectTaskForm returnTo={RETURN_TO} />
			<NavButtons onNext={onNext} onBack={onBack} />
		</Stack>
	)
}

// ── Step 14: All Projects ─────────────────────────────────────────────────────

function AllProjectsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	const allProjects = useFilteredTasks({ isProject: true })
	const active = allProjects.filter((p) => !['done', 'deleted'].includes(p.status))

	return (
		<Stack gap="md">
			<Title order={2} ta="center">
				{t('weeklyReview.allProjects.title')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('weeklyReview.allProjects.subtitle')}
			</Text>
			<Stack gap={0}>
				{active.map((project) => (
					<TaskListItem
						key={project.id}
						taskId={project.id}
						displayMeta={['area']}
						href={`/project/${project.id}?return_to=${RETURN_TO}`}
					/>
				))}
				{active.length === 0 && (
					<Text c="dimmed" ta="center" size="sm">
						{t('noTasksEmpty')}
					</Text>
				)}
			</Stack>
			<DirectTaskForm returnTo={RETURN_TO} />
			<NavButtons onNext={onNext} onBack={onBack} />
		</Stack>
	)
}

// ── Step 16: Someday ──────────────────────────────────────────────────────────

function SomedayStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	const tasks = useFilteredTasks({ status: 'someday' })

	return (
		<Stack gap="md">
			<Title order={2} ta="center">
				{t('weeklyReview.someday.title')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('weeklyReview.someday.subtitle')}
			</Text>
			<Stack gap={0}>
				{tasks.map((task) => (
					<TaskListItem
						key={task.id}
						taskId={task.id}
						displayMeta={['area']}
						href={`/task/${task.id}?return_to=${RETURN_TO}`}
					/>
				))}
				{tasks.length === 0 && (
					<Text c="dimmed" ta="center" size="sm">
						{t('noTasksEmpty')}
					</Text>
				)}
			</Stack>
			<NavButtons onNext={onNext} onBack={onBack} />
		</Stack>
	)
}

// ── Step 17: Crazy Ideas ──────────────────────────────────────────────────────

function CrazyIdeasStep({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	const [initialSeconds] = useState(() => getCrazyIdeasInitialSeconds())
	return (
		<Stack gap="md" align="center">
			<Title order={2} ta="center">
				{t('weeklyReview.crazyIdeas.title')}
			</Title>
			<Text c="dimmed" ta="center">
				{t('weeklyReview.crazyIdeas.subtitle')}
			</Text>
			<CountdownTimer seconds={CRAZY_IDEAS_TOTAL_SECONDS} initialSeconds={initialSeconds} />
			<div style={{ width: '100%' }}>
				<DirectTaskForm returnTo={RETURN_TO} />
			</div>
			<Group gap="sm">
				<ShortcutButton shortcut="1" onClick={onFinish} variant="filled" color="green" w={160}>
					{t('weeklyReview.finish')}
				</ShortcutButton>
				<ShortcutButton shortcut="2" onClick={onBack} variant="light" color="gray" w={120}>
					{t('weeklyReview.back')}
				</ShortcutButton>
			</Group>
		</Stack>
	)
}

// ── Shared nav buttons ────────────────────────────────────────────────────────

function NavButtons({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
	const { t } = useTranslation()
	return (
		<Group gap="sm" justify="center">
			<ShortcutButton shortcut="1" onClick={onNext} variant="filled" color="blue" w={120}>
				{t('weeklyReview.next')}
			</ShortcutButton>
			<ShortcutButton shortcut="2" onClick={onBack} variant="light" color="gray" w={120}>
				{t('weeklyReview.back')}
			</ShortcutButton>
		</Group>
	)
}
