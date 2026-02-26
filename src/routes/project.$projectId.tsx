import {
	ActionIcon,
	Button,
	Container,
	Group,
	Menu,
	Modal,
	Stack,
	Text,
} from '@mantine/core'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
	ArrowLeft,
	CheckCircle2,
	ChevronsDown,
	ChevronsUp,
	Ellipsis,
	FolderMinus,
	Plus,
	Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BadgeSelect } from '@/components/BadgeSelect'
import { CommandPalette } from '@/components/CommandPalette'
import { DueDatePicker } from '@/components/DueDatePicker'
import { MarkdownField } from '@/components/MarkdownField'
import { ScheduledDatePicker } from '@/components/ScheduledDatePicker'
import { SimpleTaskModal } from '@/components/SimpleTaskModal'
import { TaskFocusModal } from '@/components/TaskFocusModal'
import { TaskListItem } from '@/components/TaskListItem'
import { useFocusedTaskActions } from '@/store'
import {
	useFilteredTasks,
	useTaskActions,
	useTaskWithProject,
} from '@/store/taskStore'
import { useTheme } from '@/theme'
import type { Area, Context, Task } from '@/types'

export const Route = createFileRoute('/project/$projectId')({
	component: ProjectPage,
})

const AREAS: Area[] = ['work', 'personal', 'health', 'learning']
const CONTEXTS: Context[] = ['deep_work', 'admin', 'home', 'agenda']
const MAX_NEXT_ACTIONS = 3

// A task row used in the backlog list
function BacklogRow({
	task,
	onPromote,
}: {
	task: Task
	onPromote: (id: string) => void
}) {
	const setFocusedTaskId = useFocusedTaskActions()
	const { t } = useTranslation()
	return (
		<div className="group/row">
			<div className="flex items-center">
				<div className="flex-1 min-w-0">
					<TaskListItem
						taskId={task.id}
						displayMeta={['duration']}
						onClick={() => setFocusedTaskId(task.id)}
					/>
				</div>
				<ActionIcon
					variant="subtle"
					color="gray"
					size="sm"
					radius="sm"
					className="opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 mr-1"
					aria-label={t('ariaPromoteToNextAction')}
					onClick={(e) => {
						e.stopPropagation()
						onPromote(task.id)
					}}
				>
					<ChevronsUp size={14} />
				</ActionIcon>
			</div>
		</div>
	)
}

// A task row used in the next actions list
function NextActionRow({
	task,
	onDemote,
}: { task: Task; onDemote: (id: string) => void }) {
	const setFocusedTaskId = useFocusedTaskActions()
	const { t } = useTranslation()
	return (
		<div className="group/row">
			<div className="flex items-center">
				<div className="flex-1 min-w-0">
					<TaskListItem
						taskId={task.id}
						displayMeta={['duration']}
						onClick={() => setFocusedTaskId(task.id)}
					/>
				</div>
				<ActionIcon
					variant="subtle"
					color="gray"
					size="sm"
					radius="sm"
					className="opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 mr-1"
					aria-label={t('ariaDemoteToBacklog')}
					onClick={(e) => {
						e.stopPropagation()
						onDemote(task.id)
					}}
				>
					<ChevronsDown size={14} />
				</ActionIcon>
			</div>
		</div>
	)
}

function ProjectPage() {
	const { projectId } = Route.useParams()
	const navigate = useNavigate()
	const { t } = useTranslation()
	const { colorScheme } = useTheme()
	const isDark = colorScheme === 'dark'

	const [project] = useTaskWithProject(projectId)
	const childTasks = useFilteredTasks({ projectId })
	const { editTask, removeTask } = useTaskActions()
	const setFocusedTaskId = useFocusedTaskActions()

	const [titleValue, setTitleValue] = useState('')
	const [addTaskOpen, setAddTaskOpen] = useState(false)
	const [completeModalOpen, setCompleteModalOpen] = useState(false)
	const [cmdOpen, setCmdOpen] = useState(false)
	const titleRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (project) {
			setTitleValue(project.title)
		}
	}, [project])

	useEffect(() => {
		setTimeout(() => titleRef.current?.focus(), 50)
	}, [])

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault()
				setCmdOpen((o) => !o)
			}
			if (e.key === 'Escape') setCmdOpen(false)
		}
		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [])

	function handleBack() {
		navigate({ to: '/' })
	}

	function handleTitleBlur() {
		if (project && titleValue.trim() && titleValue.trim() !== project.title) {
			editTask(project.id, { title: titleValue.trim() })
		}
	}

	function handleTitleKey(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') e.currentTarget.blur()
		if (e.key === 'Escape') handleBack()
	}

	function handleNotesChange(value: string) {
		if (!project) return
		editTask(project.id, { notes: value })
	}

	function handleAreaChange(value: string) {
		if (!project) return
		editTask(project.id, { area: value as Area })
	}

	function handleScheduledDateChange(value: string | null) {
		if (!project) return
		editTask(project.id, { scheduledDate: value ?? undefined })
	}

	function handleDueDateChange(value: string | null) {
		if (!project) return
		editTask(project.id, { dueDate: value ?? undefined })
	}

	function handleDelete() {
		if (!project) return
		removeTask(project.id)
		navigate({ to: '/' })
	}

	function handleDemoteToTask() {
		if (!project) return
		editTask(project.id, { isProject: false })
		navigate({ to: '/' })
	}

	function handleCompleteProject() {
		if (!project) return
		const incompleteTasks = childTasks.filter((t) => t.status !== 'done')
		if (incompleteTasks.length === 0) {
			editTask(project.id, { status: 'done' })
			navigate({ to: '/' })
		} else {
			setCompleteModalOpen(true)
		}
	}

	function handleConfirmComplete() {
		if (!project) return
		const incompleteTasks = childTasks.filter((t) => t.status !== 'done')
		for (const task of incompleteTasks) {
			editTask(task.id, { status: 'done' })
		}
		editTask(project.id, { status: 'done' })
		navigate({ to: '/' })
	}

	if (!project) {
		return (
			<Container size="sm" py="xl">
				<Text c="dimmed">{t('projectNotFound')}</Text>
				<Button
					mt="md"
					variant="subtle"
					onClick={handleBack}
					leftSection={<ArrowLeft size={14} />}
				>
					{t('back')}
				</Button>
			</Container>
		)
	}

	const areaOptions = AREAS.map((a) => ({ value: a, label: t(`area.${a}`) }))

	const nextActions = childTasks.filter((t) => t.status === 'next_action')
	const backlog = childTasks.filter(
		(t) => t.status !== 'next_action' && t.status !== 'done',
	)
	const done = childTasks.filter((t) => t.status === 'done')
	const incompleteCount = childTasks.filter((t) => t.status !== 'done').length

	const dividerBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

	const sectionLabel = (label: string) => (
		<Text
			size="xs"
			fw={600}
			tt="uppercase"
			c="dimmed"
			className="tracking-wide px-2 mb-1.5"
		>
			{label}
		</Text>
	)

	return (
		<>
			<Container size="sm" py="xl" pb={80}>
				{/* Header */}
				<div
					className="flex flex-col gap-3 pb-4 mb-5"
					style={{ borderBottom: `1px solid ${dividerBorder}` }}
				>
					{/* Back + title row */}
					<div className="flex items-center gap-2">
						<ActionIcon
							onClick={handleBack}
							variant="subtle"
							color="gray"
							size="lg"
							radius="md"
							aria-label={t('back')}
						>
							<ArrowLeft size={18} />
						</ActionIcon>

						<input
							ref={titleRef}
							value={titleValue}
							onChange={(e) => setTitleValue(e.target.value)}
							onBlur={handleTitleBlur}
							onKeyDown={handleTitleKey}
							className="flex-1 min-w-0 bg-transparent border-none outline-none text-lg font-semibold py-0.5"
							style={{ color: 'var(--mantine-color-text)' }}
						/>

						<Button
							variant="filled"
							color="green"
							size="sm"
							radius="md"
							leftSection={<CheckCircle2 size={16} />}
							onClick={handleCompleteProject}
						>
							{t('ariaCompleteProject')}
						</Button>

						<Menu withinPortal position="bottom-end">
							<Menu.Target>
								<ActionIcon variant="subtle" color="gray" size="lg" radius="md">
									<Ellipsis size={18} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<FolderMinus size={14} />}
									onClick={handleDemoteToTask}
								>
									{t('projectDemoteToTask')}
								</Menu.Item>
								<Menu.Divider />
								<Menu.Item
									leftSection={<Trash2 size={14} />}
									color="red"
									onClick={handleDelete}
								>
									{t('focusModalDelete')}
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</div>

					{/* Badges + dates on same row */}
					<div className="flex flex-wrap gap-1.5 items-center">
						<BadgeSelect
							options={areaOptions}
							value={project.area ?? null}
							onSelect={handleAreaChange}
							color="violet"
						/>
						<ScheduledDatePicker
							value={project.scheduledDate ?? null}
							onChange={handleScheduledDateChange}
						/>
						<DueDatePicker
							value={project.dueDate ?? null}
							onChange={handleDueDateChange}
						/>
					</div>
				</div>

				{/* Next Actions */}
				<Stack gap={0} mb={4}>
					{sectionLabel(t('projectNextActions'))}
					<div className="rounded-lg overflow-hidden">
						{nextActions.length === 0 && (
							<div
								className="px-3 py-2.5 rounded-lg text-[13px]"
								style={{
									backgroundColor: isDark
										? 'rgba(250,176,5,0.1)'
										: 'rgba(250,176,5,0.08)',
									border: '1px solid rgba(250,176,5,0.3)',
									color: 'var(--mantine-color-yellow-7)',
								}}
							>
								{t('projectNoNextAction')}
							</div>
						)}
						{nextActions.map((task) => (
							<NextActionRow
								key={task.id}
								task={task}
								onDemote={(id) => editTask(id, { status: 'inbox' })}
							/>
						))}
					</div>
				</Stack>

				{/* Notes */}
				<div
					className="my-5"
					style={{ borderTop: `1px solid ${dividerBorder}` }}
				/>
				<div className="mb-6">
					<MarkdownField
						value={project.notes ?? ''}
						onChange={handleNotesChange}
					/>
				</div>

				{/* Backlog */}
				<div
					className="my-5"
					style={{ borderTop: `1px solid ${dividerBorder}` }}
				/>
				<Stack gap={0}>
					<Group justify="space-between" align="center" mb={6} px="xs">
						<Text
							size="xs"
							fw={600}
							tt="uppercase"
							c="dimmed"
							className="tracking-wide"
						>
							{t('projectTasks')}
						</Text>
						<ActionIcon
							variant="subtle"
							color="gray"
							size="xs"
							radius="sm"
							onClick={() => setAddTaskOpen(true)}
							aria-label={t('simpleTaskModalTitle')}
						>
							<Plus size={14} />
						</ActionIcon>
					</Group>
					{backlog.length === 0 ? (
						<Text
							size="sm"
							c="dimmed"
							px="xs"
							py="xs"
							className="italic opacity-60"
						>
							{t('projectBacklogEmpty')}
						</Text>
					) : (
						backlog.map((task) => (
							<BacklogRow
								key={task.id}
								task={task}
								onPromote={(id) => editTask(id, { status: 'next_action' })}
							/>
						))
					)}
				</Stack>

				{/* Done */}
				{done.length > 0 && (
					<>
						<div
							className="my-5"
							style={{ borderTop: `1px solid ${dividerBorder}` }}
						/>
						<Stack gap={0}>
							{sectionLabel(t('status.done'))}
							{done.map((task) => (
								<div key={task.id} className="opacity-45">
									<TaskListItem
										taskId={task.id}
										displayMeta={['duration']}
										onClick={() => setFocusedTaskId(task.id)}
									/>
								</div>
							))}
						</Stack>
					</>
				)}
			</Container>

			<SimpleTaskModal
				open={addTaskOpen}
				onClose={() => setAddTaskOpen(false)}
				projectId={projectId}
			/>

			{/* Complete project confirmation modal */}
			<Modal
				opened={completeModalOpen}
				onClose={() => setCompleteModalOpen(false)}
				title={t('projectCompleteTitle')}
				centered
			>
				<Text size="sm" mb="lg">
					{t('projectCompleteText', { count: incompleteCount })}
				</Text>
				<Group justify="flex-end" gap="sm">
					<Button
						variant="subtle"
						onClick={() => setCompleteModalOpen(false)}
					>
						{t('projectCompleteCancel')}
					</Button>
					<Button color="green" onClick={handleConfirmComplete}>
						{t('projectCompleteConfirm')}
					</Button>
				</Group>
			</Modal>

			<CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
			<TaskFocusModal />
		</>
	)
}
