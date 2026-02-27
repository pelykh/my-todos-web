import { Stack, TextInput } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import { BadgeSelect } from '@/components/BadgeSelect'
import { DueDatePicker } from '@/components/DueDatePicker'
import { MarkdownField } from '@/components/MarkdownField'
import { ScheduledDatePicker } from '@/components/ScheduledDatePicker'
import { useTaskActions } from '@/store/taskStore'
import type { Area, Context, Task } from '@/types'

export type TaskFormField =
	| 'title'
	| 'notes'
	| 'area'
	| 'context'
	| 'duration'
	| 'dueDate'
	| 'scheduledDate'

type Props = {
	task: Task
	fields: TaskFormField[]
}

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

export function TaskForm({ task, fields }: Props) {
	const { t } = useTranslation()
	const { editTask } = useTaskActions()

	const show = (f: TaskFormField) => fields.includes(f)

	const contextOptions = CONTEXTS.map((c) => ({ value: c, label: t(`context.${c}`) }))
	const areaOptions = AREAS.map((a) => ({ value: a, label: t(`area.${a}`) }))

	return (
		<Stack gap="sm" w="100%">
			{show('title') && (
				<TextInput
					defaultValue={task.title}
					onBlur={(e) => {
						const v = e.currentTarget.value.trim()
						if (v !== task.title) editTask(task.id, { title: v })
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') e.currentTarget.blur()
					}}
					/>
			)}

			{(show('context') || show('area') || show('duration')) && (
				<div className="flex gap-2 flex-wrap">
					{show('context') && (
						<BadgeSelect
							options={contextOptions}
							value={task.context ?? null}
							onSelect={(v) => editTask(task.id, { context: v as Context })}
							placeholder={t('focusModalContext')}
							color="blue"
						/>
					)}
					{show('area') && (
						<BadgeSelect
							options={areaOptions}
							value={task.area ?? null}
							onSelect={(v) => editTask(task.id, { area: v as Area })}
							placeholder={t('focusModalArea')}
							color="violet"
						/>
					)}
					{show('duration') && (
						<BadgeSelect
							options={DURATION_OPTIONS}
							value={task.estimatedMinutes ? String(task.estimatedMinutes) : null}
							onSelect={(v) => editTask(task.id, { estimatedMinutes: parseInt(v, 10) })}
							placeholder={t('focusModalTime')}
							color="gray"
						/>
					)}
				</div>
			)}

			{(show('scheduledDate') || show('dueDate')) && (
				<div className="flex gap-2 items-center">
					{show('scheduledDate') && (
						<ScheduledDatePicker
							value={task.scheduledDate ?? null}
							onChange={(v) => editTask(task.id, { scheduledDate: v ?? undefined })}
						/>
					)}
					{show('dueDate') && (
						<DueDatePicker
							value={task.dueDate ?? null}
							onChange={(v) => editTask(task.id, { dueDate: v ?? undefined })}
						/>
					)}
				</div>
			)}

			{show('notes') && (
				<MarkdownField
					value={task.notes ?? ''}
					onChange={(v) => editTask(task.id, { notes: v })}
					minHeight={60}
				/>
			)}
		</Stack>
	)
}
