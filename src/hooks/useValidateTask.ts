import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaskFormField } from '@/components/TaskForm'
import type { Task } from '@/types'

type Options = {
	task: Task
	fields: TaskFormField[]
	onSubmit: () => void
}

export function useValidateTask({ task, fields, onSubmit }: Options) {
	const { t } = useTranslation()
	const [submitted, setSubmitted] = useState(false)

	function validate(): string[] {
		const errs: string[] = []
    for (const field of fields) {
			if (field === 'title' && !task.title.trim())
				errs.push(t('validationRequired', { field: t('fieldTitle') }))
			if (field === 'notes' && !task.notes?.trim())
				errs.push(t('validationRequired', { field: t('fieldNotes') }))
			if (field === 'area' && !task.area)
				errs.push(t('validationRequired', { field: t('focusModalArea') }))
			if (field === 'context' && !task.context)
				errs.push(t('validationRequired', { field: t('focusModalContext') }))
			if (field === 'duration' && !task.estimatedMinutes)
				errs.push(t('validationRequired', { field: t('focusModalTime') }))
			if (field === 'dueDate' && !task.dueDate)
				errs.push(t('validationRequired', { field: t('dueDate') }))
			if (field === 'scheduledDate' && !task.scheduledDate)
				errs.push(t('validationRequired', { field: t('scheduledDate') }))
		}
		return errs
	}

	function handleSubmit() {
		setSubmitted(true)
		const errs = validate()
		if (errs.length === 0) onSubmit()
	}

	const liveErrors = submitted ? validate() : []
	const canSubmit = liveErrors.length === 0

	return { canSubmit, errors: liveErrors, handleSubmit }
}
