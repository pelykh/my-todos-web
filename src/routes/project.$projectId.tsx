import {
	ActionIcon,
	Button,
	Container,
	Group,
	Menu,
	Stack,
	Text,
	Textarea,
} from '@mantine/core'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ChevronsUp, Ellipsis, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { BadgeSelect } from '@/components/BadgeSelect'
import { DueDatePicker } from '@/components/DueDatePicker'
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
const DURATION_OPTIONS = [
	{ value: '5', label: "5'" },
	{ value: '15', label: "15'" },
	{ value: '30', label: "30'" },
	{ value: '45', label: "45'" },
	{ value: '60', label: '1h' },
	{ value: '120', label: '2h' },
]
const MAX_NEXT_ACTIONS = 3

// A draggable task row used in the backlog list
function DraggableTaskRow({
	task,
	onDragStart,
	onDragEnd,
	onPromote,
}: {
	task: Task
	onDragStart: (id: string) => void
	onDragEnd: () => void
	onPromote: (id: string) => void
}) {
	const setFocusedTaskId = useFocusedTaskActions()
	const { t } = useTranslation()
	return (
		<div
			draggable
			onDragStart={(e) => {
				e.dataTransfer.effectAllowed = 'move'
				onDragStart(task.id)
			}}
			onDragEnd={onDragEnd}
			className="group/row"
			style={{ cursor: 'grab' }}
		>
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
					size="xs"
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
	const [notesValue, setNotesValue] = useState('')
	const [notesEditMode, setNotesEditMode] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const [addTaskOpen, setAddTaskOpen] = useState(false)
	const [isOverNextActions, setIsOverNextActions] = useState(false)
	const draggingIdRef = useRef<string | null>(null)
	const titleRef = useRef<HTMLInputElement>(null)
	const checkboxIndexRef = useRef(0)

	useEffect(() => {
		if (project) {
			setTitleValue(project.title)
			setNotesValue(project.notes ?? '')
			setNotesEditMode(false)
		}
	}, [project])

	useEffect(() => {
		setTimeout(() => titleRef.current?.focus(), 50)
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

	function handleNotesBlur() {
		if (project && notesValue !== (project.notes ?? '')) {
			editTask(project.id, { notes: notesValue })
		}
		setNotesEditMode(false)
	}

	function handleAreaChange(value: string) {
		if (!project) return
		editTask(project.id, { area: value as Area })
	}

	function handleContextChange(value: string) {
		if (!project) return
		editTask(project.id, { context: value as Context })
	}

	function handleDurationChange(value: string) {
		if (!project) return
		editTask(project.id, { estimatedMinutes: Number(value) })
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

	function toggleCheckbox(index: number) {
		if (!project) return
		let count = 0
		const updated = (project.notes ?? '').replace(
			/^(\s*[-*+]\s+)\[([ x])\]/gm,
			(match, prefix, state) => {
				const result =
					count === index ? `${prefix}[${state === ' ' ? 'x' : ' '}]` : match
				count++
				return result
			},
		)
		setNotesValue(updated)
		editTask(project.id, { notes: updated })
	}

	// ── DnD handlers ─────────────────────────────────────────────────────────

	function handleDragStart(id: string) {
		draggingIdRef.current = id
		setIsDragging(true)
	}

	function handleDragEnd() {
		setIsDragging(false)
		setIsOverNextActions(false)
		draggingIdRef.current = null
	}

	function handleNextActionsDragOver(e: React.DragEvent) {
		e.preventDefault()
		e.dataTransfer.dropEffect = 'move'
		setIsOverNextActions(true)
	}

	function handleNextActionsDragLeave() {
		setIsOverNextActions(false)
	}

	function handleNextActionsDrop(e: React.DragEvent) {
		e.preventDefault()
		setIsOverNextActions(false)
		setIsDragging(false)

		const fromNextAction =
			e.dataTransfer.getData('application/x-from-next-action') === '1'
		const draggedId = fromNextAction
			? e.dataTransfer.getData('text/plain')
			: draggingIdRef.current

		draggingIdRef.current = null
		if (!draggedId) return

		const task = childTasks.find((t) => t.id === draggedId)
		if (!task) return

		// Already a next action — no-op
		if (task.status === 'next_action') return

		// Only promote if there's room
		if (nextActions.length >= MAX_NEXT_ACTIONS) return

		editTask(draggedId, { status: 'next_action' })
	}

	// A next-action item dragged back over the backlog — demote on drop
	function handleBacklogDrop(e: React.DragEvent) {
		e.preventDefault()
		const fromNextAction =
			e.dataTransfer.getData('application/x-from-next-action') === '1'
		if (!fromNextAction) return
		const draggedId = e.dataTransfer.getData('text/plain')
		if (!draggedId) return
		editTask(draggedId, { status: 'inbox' })
	}

	// ─────────────────────────────────────────────────────────────────────────

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

	checkboxIndexRef.current = 0

	const areaOptions = AREAS.map((a) => ({ value: a, label: t(`area.${a}`) }))
	const contextOptions = CONTEXTS.map((c) => ({
		value: c,
		label: t(`context.${c}`),
	}))

	const nextActions = childTasks.filter((t) => t.status === 'next_action')
	const backlog = childTasks.filter(
		(t) => t.status !== 'next_action' && t.status !== 'done',
	)
	const done = childTasks.filter((t) => t.status === 'done')

	const dividerEl = (
		<div
			style={{
				borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
				margin: '20px 0 16px',
			}}
		/>
	)

	const sectionLabel = (label: string) => (
		<Text
			size="xs"
			fw={600}
			tt="uppercase"
			style={{
				letterSpacing: '0.05em',
				padding: '0 8px',
				marginBottom: 6,
				color: 'var(--mantine-color-dimmed)',
			}}
		>
			{label}
		</Text>
	)

	return (
		<>
			<Container size="sm" py="xl" pb={80}>
				{/* Header */}
				<div
					style={{
						padding: '0 0 16px',
						borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
						display: 'flex',
						flexDirection: 'column',
						gap: 12,
						marginBottom: 20,
					}}
				>
					{/* Back + title row */}
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
							style={{
								flex: 1,
								fontSize: 18,
								fontWeight: 600,
								background: 'transparent',
								border: 'none',
								outline: 'none',
								color: 'var(--mantine-color-text)',
								padding: '2px 0',
								minWidth: 0,
							}}
						/>

						<Menu withinPortal position="bottom-end">
							<Menu.Target>
								<ActionIcon variant="subtle" color="gray" size="lg" radius="md">
									<Ellipsis size={18} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
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

					{/* Badges: context, area, duration */}
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
						<BadgeSelect
							options={areaOptions}
							value={project.area ?? null}
							onSelect={handleAreaChange}
							color="violet"
						/>
					</div>
					{/* Date row */}
					<div className="flex gap-2 items-center">
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
					<div
						onDragOver={handleNextActionsDragOver}
						onDragLeave={handleNextActionsDragLeave}
						onDrop={handleNextActionsDrop}
						style={{
							borderRadius: 8,
							border: isDragging
								? `1.5px dashed ${isOverNextActions ? 'var(--mantine-color-orange-6)' : isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)'}`
								: '1.5px dashed transparent',
							background: isOverNextActions
								? isDark
									? 'rgba(255,140,0,0.07)'
									: 'rgba(255,140,0,0.05)'
								: 'transparent',
							transition: 'border-color 0.15s, background 0.15s',
							overflow: 'hidden',
						}}
					>
						{nextActions.length === 0 && !isDragging ? null : (
							<>
								{nextActions.map((task) => (
									<div
										key={task.id}
										draggable
										onDragStart={(e) => {
											e.dataTransfer.effectAllowed = 'move'
											e.dataTransfer.setData('text/plain', task.id)
											e.dataTransfer.setData(
												'application/x-from-next-action',
												'1',
											)
											setIsDragging(true)
										}}
										onDragEnd={handleDragEnd}
										style={{ cursor: 'grab' }}
									>
										<TaskListItem
											taskId={task.id}
											displayMeta={['duration']}
											onClick={() => setFocusedTaskId(task.id)}
										/>
									</div>
								))}
								{isDragging && nextActions.length < MAX_NEXT_ACTIONS && (
									<div
										style={{
											height: 36,
											display: 'flex',
											alignItems: 'center',
											paddingLeft: 12,
											color: 'var(--mantine-color-dimmed)',
											fontSize: 12,
											fontStyle: 'italic',
											opacity: 0.45,
											userSelect: 'none',
										}}
									/>
								)}
							</>
						)}
						{nextActions.length === 0 && isDragging && (
							<div
								style={{
									height: 40,
									display: 'flex',
									alignItems: 'center',
									paddingLeft: 12,
									color: 'var(--mantine-color-dimmed)',
									fontSize: 12,
									fontStyle: 'italic',
									opacity: 0.45,
									userSelect: 'none',
								}}
							/>
						)}
					</div>
				</Stack>

				{/* Notes */}
				{dividerEl}
				<div style={{ marginBottom: 24 }}>
					{notesEditMode ? (
						<Textarea
							autoFocus
							value={notesValue}
							onChange={(e) => setNotesValue(e.currentTarget.value)}
							onBlur={handleNotesBlur}
							placeholder={t('focusModalNotesPlaceholder')}
							autosize
							minRows={5}
							styles={{
								input: {
									fontSize: 14,
									background: 'transparent',
									border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
									fontFamily: 'monospace',
								},
							}}
						/>
					) : (
						<div
							onDoubleClick={() => setNotesEditMode(true)}
							style={{
								minHeight: 48,
								cursor: 'text',
								borderRadius: 8,
								padding: '6px 4px',
								color: notesValue
									? 'var(--mantine-color-text)'
									: 'var(--mantine-color-dimmed)',
								fontSize: 14,
								lineHeight: 1.6,
							}}
						>
							{notesValue ? (
								<div className="markdown-preview">
									<ReactMarkdown
										remarkPlugins={[remarkGfm]}
										components={{
											input({ checked }) {
												const index = checkboxIndexRef.current++
												return (
													<input
														type="checkbox"
														checked={checked ?? false}
														onChange={() => toggleCheckbox(index)}
														style={{ cursor: 'pointer', marginRight: 4 }}
													/>
												)
											},
										}}
									>
										{notesValue}
									</ReactMarkdown>
								</div>
							) : (
								<span style={{ fontStyle: 'italic', opacity: 0.5 }}>
									{t('focusModalNotesPlaceholder')}
								</span>
							)}
						</div>
					)}
				</div>

				{/* Backlog */}
				{dividerEl}
				<Stack
					gap={0}
					onDragOver={(e) => e.preventDefault()}
					onDrop={handleBacklogDrop}
				>
					<Group justify="space-between" align="center" mb={6} px="xs">
						<Text
							size="xs"
							fw={600}
							tt="uppercase"
							style={{
								letterSpacing: '0.05em',
								color: 'var(--mantine-color-dimmed)',
							}}
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
							style={{ fontStyle: 'italic', opacity: 0.6 }}
						>
							{t('projectBacklogEmpty')}
						</Text>
					) : (
						backlog.map((task) => (
							<DraggableTaskRow
								key={task.id}
								task={task}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
								onPromote={(id) => editTask(id, { status: 'next_action' })}
							/>
						))
					)}
				</Stack>

				{/* Done */}
				{done.length > 0 && (
					<>
						{dividerEl}
						<Stack gap={0}>
							{sectionLabel(t('status.done'))}
							{done.map((task) => (
								<div key={task.id} style={{ opacity: 0.45 }}>
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
			<TaskFocusModal />
		</>
	)
}
