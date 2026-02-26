import { ActionIcon, Button, Menu } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, Ellipsis, FolderKanban, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BadgeSelect } from '@/components/BadgeSelect'
import { DueDatePicker } from '@/components/DueDatePicker'
import { MarkdownField } from '@/components/MarkdownField'
import { ScheduledDatePicker } from '@/components/ScheduledDatePicker'
import { useFocusedTaskActions, useFocusedTaskId } from '@/store'
import { useTaskActions, useTaskWithProject } from '@/store/taskStore'
import { useTheme } from '@/theme'
import type { Area, Context } from '@/types'

const CONTEXTS: Context[] = ['deep_work', 'admin', 'home', 'agenda']
const AREAS: Area[] = ['work', 'personal', 'health', 'learning']
const DURATION_OPTIONS = [
	{ value: '5', label: "5'" },
	{ value: '15', label: "15'" },
	{ value: '30', label: "30'" },
	{ value: '45', label: "45'" },
	{ value: '60', label: '1h' },
	{ value: '120', label: '2h' },
]

export function TaskFocusModal() {
	const { t } = useTranslation()
	const { colorScheme } = useTheme()
	const isDark = colorScheme === 'dark'

	const navigate = useNavigate()
	const focusedTaskId = useFocusedTaskId()
	const setFocusedTaskId = useFocusedTaskActions()
	const [task, project] = useTaskWithProject(focusedTaskId!)
	const { editTask, removeTask } = useTaskActions()

	const [visible, setVisible] = useState(false)
	const [titleValue, setTitleValue] = useState('')
	const titleRef = useRef<HTMLInputElement>(null)

	// Animate open/close
	useEffect(() => {
		if (focusedTaskId) {
			setVisible(true)
		}
	}, [focusedTaskId])

	// Sync local state when task changes
	useEffect(() => {
		if (task) {
			setTitleValue(task.title)
		}
	}, [task])

	// Focus title input when modal opens
	useEffect(() => {
		if (visible && task) {
			setTimeout(() => titleRef.current?.focus(), 50)
		}
	}, [visible, task])

	// Close on Escape
	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') handleClose()
		}
		if (focusedTaskId) {
			window.addEventListener('keydown', handleKey)
			return () => window.removeEventListener('keydown', handleKey)
		}
	}, [focusedTaskId])

	function handleClose() {
		setVisible(false)
		setTimeout(() => setFocusedTaskId(null), 250)
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
		handleClose()
	}

	function handleDelete() {
		if (!task) return
		removeTask(task.id)
		handleClose()
	}

	function handlePromoteToProject() {
		if (!task) return
		editTask(task.id, { isProject: true, status: 'next_action' })
		handleClose()
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

	if (!focusedTaskId && !visible) return null

	const overlay: React.CSSProperties = {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100vw',
		height: '100vh',
		backgroundColor: 'var(--mantine-color-body)',
		zIndex: 200,
		display: 'flex',
		alignItems: 'flex-start',
		justifyContent: 'center',
		opacity: visible ? 1 : 0,
		transition: 'opacity 0.25s ease',
	}

	const modal: React.CSSProperties = {
		width: '100%',
		maxWidth: 640,
		height: '100%',
		backgroundColor: 'var(--mantine-color-body)',
		borderRadius: 0,
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		transform: visible
			? 'translateY(0) scale(1)'
			: 'translateY(16px) scale(0.97)',
		transition: 'transform 0.25s ease, opacity 0.25s ease',
		opacity: visible ? 1 : 0,
		paddingTop: '10%',
	}

	if (!task) return null

	const contextOptions = CONTEXTS.map((c) => ({
		value: c,
		label: t(`context.${c}`),
	}))
	const areaOptions = AREAS.map((a) => ({ value: a, label: t(`area.${a}`) }))

	return (
		<div style={overlay}>
			<div style={modal} onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div
					className="flex flex-col gap-3 px-5 pt-5 pb-4"
					style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}
				>
					{/* Title row */}
					<div className="flex items-center gap-2">
						<input
							ref={titleRef}
							value={titleValue}
							onChange={(e) => setTitleValue(e.target.value)}
							onBlur={handleTitleBlur}
							onKeyDown={handleTitleKey}
							className="flex-1 min-w-0 bg-transparent border-none outline-none text-lg font-semibold py-0.5 text-(--mantine-color-text)"
						/>
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
							onClick={handleClose}
							variant="subtle"
							color="gray"
							size="lg"
							radius="md"
							aria-label={t('focusModalClose')}
						>
							<X size={18} />
						</ActionIcon>
					</div>

					{/* Tags row */}
					<div className="flex gap-2 items-center">
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
							value={
								task.estimatedMinutes ? String(task.estimatedMinutes) : null
							}
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
								style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}
							/>
							<div className="flex flex-col gap-1.5">
								<span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-(--mantine-color-dimmed)">
									{t('project')}
								</span>
								<Button
									onClick={() => {
										handleClose()
										navigate({
											to: '/project/$projectId',
											params: { projectId: project.id },
										})
									}}
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
	)
}
