import { ActionIcon, Button, Menu } from '@mantine/core'
import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { Archive, CheckCircle2, Ellipsis, FolderKanban, RotateCcw, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WhatsNextModal } from '@/components/WhatsNextModal'
import { BadgeSelect } from '@/components/BadgeSelect'
import { DueDatePicker } from '@/components/DueDatePicker'
import { MarkdownField } from '@/components/MarkdownField'
import { ScheduledDatePicker } from '@/components/ScheduledDatePicker'
import { useFilteredTasks, useTaskActions, useTaskWithProject } from '@/store/taskStore'
import { useTheme } from '@/theme'
import type { Area, Context } from '@/types'
import { AREAS } from '@/types'

export const Route = createFileRoute('/task/$taskId')({ component: TaskPage })

const CONTEXTS: Context[] = ['deep_work', 'admin', 'home', 'agenda']
const DURATION_OPTIONS = [
	{ value: '5', label: "5'" },
	{ value: '15', label: "15'" },
	{ value: '30', label: "30'" },
	{ value: '45', label: "45'" },
	{ value: '60', label: '1h' },
	{ value: '120', label: '2h' },
]

function TaskPage() {
	const { taskId } = Route.useParams()
	const { t } = useTranslation()
	const { colorScheme } = useTheme()
	const isDark = colorScheme === 'dark'
	const navigate = useNavigate()
	const router = useRouter()

	const [task, project] = useTaskWithProject(taskId)
	const { editTask, removeTask } = useTaskActions()
	const projectNextActions = useFilteredTasks(
		task?.projectId ? { projectId: task.projectId, status: 'next_action' } : undefined,
	)
	const [whatsNextOpen, setWhatsNextOpen] = useState(false)

	const [titleValue, setTitleValue] = useState('')
	const titleRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (task) setTitleValue(task.title)
	}, [task])

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') handleBack()
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
		if (task && titleValue.trim() && titleValue.trim() !== task.title) {
			editTask(task.id, { title: titleValue.trim() })
		}
	}

	function handleTitleKey(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') e.currentTarget.blur()
	}

	function handleNotesChange(value: string) {
		if (!task) return
		editTask(task.id, { notes: value })
	}

	function handleComplete() {
		if (!task) return
		editTask(task.id, { status: 'done' })

		const taskId = task.id
		const taskTitle = task.title
		toast(t('toastTaskCompleted'), {
			description: taskTitle,
			action: {
				label: t('toastUndo'),
				onClick: () => {
					editTask(taskId, { status: 'next_action' })
					navigate({ to: '/task/$taskId', params: { taskId } })
				},
			},
		})

		if (task.projectId) {
			const remaining = projectNextActions.filter((t) => t.id !== task.id)
			if (remaining.length === 0) {
				setWhatsNextOpen(true)
				return
			}
		}

		handleBack()
	}

	function handleRestore() {
		if (!task) return
		editTask(task.id, { status: 'next_action' })
	}

	function handleDelete() {
		if (!task) return
		removeTask(task.id)
		handleBack()
	}

	function handleMoveToSomeday() {
		if (!task) return
		editTask(task.id, { status: 'someday' })
	}

	function handleRestoreFromSomeday() {
		if (!task) return
		editTask(task.id, { status: task.projectId ? 'backlog' : 'next_action' })
	}

	function handlePromoteToProject() {
		if (!task) return
		editTask(task.id, { isProject: true, status: 'next_action' })
		navigate({ to: '/project/$projectId', params: { projectId: task.id } })
	}

	function handleContextChange(value: string) {
		if (!task) return
		editTask(task.id, { context: value as Context })
	}

	function handleAreaChange(value: string) {
		if (!task) return
		editTask(task.id, { area: value as Area })
	}

	function handleTimeChange(value: string) {
		if (!task) return
		editTask(task.id, { estimatedMinutes: parseInt(value, 10) })
	}

	function handleScheduledDateChange(value: string | null) {
		if (!task) return
		editTask(task.id, { scheduledDate: value ?? undefined })
	}

	function handleDueDateChange(value: string | null) {
		if (!task) return
		editTask(task.id, { dueDate: value ?? undefined })
	}

	if (!task) {
		return (
			<div className="flex items-center justify-center h-screen">
				<span style={{ color: 'var(--mantine-color-dimmed)' }}>
					{t('taskNotFound')}
				</span>
			</div>
		)
	}

	const contextOptions = CONTEXTS.map((c) => ({
		value: c,
		label: t(`context.${c}`),
	}))
	const areaOptions = AREAS.map((a) => ({ value: a, label: t(`area.${a}`) }))

	const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

	return (
		<>
		<div className="flex justify-center min-h-screen" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
			<div
				className="w-full flex flex-col"
				style={{ maxWidth: 640, paddingTop: '10%' }}
			>
				{/* Header */}
				<div
					className="flex flex-col gap-3 px-5 pt-5 pb-4"
					style={{ borderBottom: `1px solid ${divider}` }}
				>
					{/* Title row */}
					<div className="flex flex-col sm:flex-row sm:items-center gap-2">
						<input
							ref={titleRef}
							value={titleValue}
							onChange={(e) => setTitleValue(e.target.value)}
							onBlur={handleTitleBlur}
							onKeyDown={handleTitleKey}
							className="flex-1 min-w-0 bg-transparent border-none outline-none text-lg font-semibold py-0.5 text-(--mantine-color-text)"
						/>
						<div className="flex items-center gap-2 shrink-0">
							{task.status === 'done' ? (
								<Button
									onClick={handleRestore}
									variant="filled"
									color="gray"
									size="sm"
									radius="md"
									leftSection={<RotateCcw size={16} />}
								>
									{t('taskRestore')}
								</Button>
							) : (
								<Button
									onClick={handleComplete}
									variant="filled"
									color="green"
									size="sm"
									radius="md"
									leftSection={<CheckCircle2 size={16} />}
								>
									{t('focusModalComplete')}
								</Button>
							)}
							<Menu withinPortal zIndex={600} position="bottom-end">
								<Menu.Target>
									<ActionIcon variant="subtle" color="gray" size="lg" radius="md">
										<Ellipsis size={18} />
									</ActionIcon>
								</Menu.Target>
								<Menu.Dropdown>
									{!task.isProject && (
										<Menu.Item
											leftSection={<FolderKanban size={14} />}
											onClick={handlePromoteToProject}
										>
											{t('focusModalPromoteToProject')}
										</Menu.Item>
									)}
									{task.status === 'someday' ? (
										<Menu.Item
											leftSection={<Archive size={14} />}
											onClick={handleRestoreFromSomeday}
										>
											{task.projectId ? t('taskMoveToBacklog') : t('taskMoveToNextAction')}
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
					</div>

					{/* Tags row */}
					<div className="flex gap-2 items-center flex-wrap">
						<BadgeSelect
							options={contextOptions}
							value={task.context ?? null}
							onSelect={handleContextChange}
							placeholder={t('focusModalContext')}
							color="blue"
						/>
						{!project && (
							<BadgeSelect
								options={areaOptions}
								value={task.area ?? null}
								onSelect={handleAreaChange}
								placeholder={t('focusModalArea')}
								color="violet"
							/>
						)}
						<BadgeSelect
							options={DURATION_OPTIONS}
							value={task.estimatedMinutes ? String(task.estimatedMinutes) : null}
							onSelect={handleTimeChange}
							placeholder={t('focusModalTime')}
							color="gray"
						/>
					</div>

					{/* Date row */}
					<div className="flex gap-2 items-center">
						<ScheduledDatePicker
							value={task.scheduledDate ?? null}
							onChange={handleScheduledDateChange}
						/>
						<DueDatePicker
							value={task.dueDate ?? null}
							onChange={handleDueDateChange}
						/>
					</div>
				</div>

				{/* Notes */}
				<div className="flex-1 overflow-y-auto px-5 py-4">
					<MarkdownField
						value={task.notes ?? ''}
						onChange={handleNotesChange}
						minHeight={80}
					/>

					{project && (
						<>
							<div
								className="mt-4 mb-3.5"
								style={{ borderTop: `1px solid ${divider}` }}
							/>
							<div className="flex flex-col gap-1.5">
								<span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-(--mantine-color-dimmed)">
									{t('project')}
								</span>
								<Button
									onClick={() =>
										navigate({
											to: '/project/$projectId',
											params: { projectId: project.id },
										})
									}
									variant="subtle"
									color="gray"
									size="xs"
									radius="md"
									justify="start"
									className="self-start"
								>
									{project.title}
								</Button>
								{project.notes && (
									<MarkdownField
										value={project.notes}
										onChange={() => {}}
										minHeight={0}
										readOnly
									/>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>

		{task.projectId && (
			<WhatsNextModal
				projectId={task.projectId}
				opened={whatsNextOpen}
				onClose={() => {
					setWhatsNextOpen(false)
					handleBack()
				}}
			/>
		)}
		</>
	)
}
