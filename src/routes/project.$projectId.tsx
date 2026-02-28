import {
	ActionIcon,
	Button,
	Group,
	Menu,
	Modal,
	Stack,
	Text,
} from '@mantine/core'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import {
	Archive,
	CheckCircle2,
	ChevronsDown,
	ChevronsUp,
	Ellipsis,
	FolderKanban,
	FolderMinus,
	Plus,
	Trash2,
	X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BadgeSelect } from '@/components/BadgeSelect'
import { CommandPalette } from '@/components/CommandPalette'
import { DueDatePicker } from '@/components/DueDatePicker'
import { MarkdownField } from '@/components/MarkdownField'
import { ScheduledDatePicker } from '@/components/ScheduledDatePicker'
import { SimpleTaskModal } from '@/components/SimpleTaskModal'
import { TaskListItem } from '@/components/TaskListItem'
import {
	useFilteredTasks,
	useTaskActions,
	useTaskWithProject,
} from '@/store/taskStore'
import { useTheme } from '@/theme'
import type { Area, Context, Task } from '@/types'
import { AREAS } from '@/types'

export const Route = createFileRoute('/project/$projectId')({
	component: ProjectPage,
})

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
	const { t } = useTranslation()
	return (
		<div className="group/row">
			<div className="flex items-center">
				<div className="flex-1 min-w-0">
					<TaskListItem
						taskId={task.id}
						displayMeta={['duration']}
						href={`/task/${task.id}`}
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
	const { t } = useTranslation()
	return (
		<div className="group/row">
			<div className="flex items-center">
				<div className="flex-1 min-w-0">
					<TaskListItem
						taskId={task.id}
						displayMeta={['duration']}
						href={`/task/${task.id}`}
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
	const router = useRouter()
	const { t } = useTranslation()
	const { colorScheme } = useTheme()
	const isDark = colorScheme === 'dark'

	const [project] = useTaskWithProject(projectId)
	const childTasks = useFilteredTasks({ projectId })
	const { editTask, removeTask } = useTaskActions()

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
		if (window.history.length > 1) {
			router.history.back()
		} else {
			navigate({ to: '/' })
		}
	}

	function handleTitleBlur() {
		if (project && titleValue.trim() && titleValue.trim() !== project.title) {
			editTask(project.id, { title: titleValue.trim() })
		}
	}

	function handleTitleKey(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') e.currentTarget.blur()
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

	function handleMoveToSomeday() {
		if (!project) return
		editTask(project.id, { status: 'someday' })
	}

	function handleRestoreFromSomeday() {
		if (!project) return
		editTask(project.id, { status: 'next_action' })
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
			<div className="flex justify-center min-h-screen">
				<div className="w-full px-5" style={{ maxWidth: 640, paddingTop: '10%' }}>
					<Text c="dimmed">{t('projectNotFound')}</Text>
					<Button
						mt="md"
						variant="subtle"
						onClick={handleBack}
					>
						{t('back')}
					</Button>
				</div>
			</div>
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
			<div className="flex justify-center min-h-screen">
			<div className="w-full flex flex-col pb-20" style={{ maxWidth: 640, paddingTop: '10%' }}>
				{/* Header */}
				<div
					className="flex flex-col gap-3 px-5 pb-4 mb-5"
					style={{ borderBottom: `1px solid ${dividerBorder}` }}
				>
					{/* Title row */}
					<div className="flex items-center gap-2">
						<FolderKanban
							size={18}
							style={{ color: 'var(--mantine-color-dimmed)', flexShrink: 0 }}
						/>

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
								{project.status === 'someday' ? (
									<Menu.Item
										leftSection={<Archive size={14} />}
										onClick={handleRestoreFromSomeday}
									>
										{t('taskMoveToNextAction')}
									</Menu.Item>
								) : (
									<Menu.Item
										leftSection={<Archive size={14} />}
										onClick={handleMoveToSomeday}
									>
										{t('taskMoveToSomeday')}
									</Menu.Item>
								)}
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

						<ActionIcon
							onClick={handleBack}
							variant="subtle"
							color="gray"
							size="lg"
							radius="md"
							aria-label={t('focusModalClose')}
						>
							<X size={18} />
						</ActionIcon>
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

				<div className="px-5">

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
										href={`/task/${task.id}`}
									/>
								</div>
							))}
						</Stack>
					</>
				)}
				</div>
		</div>
		</div>

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
		</>
	)
}
