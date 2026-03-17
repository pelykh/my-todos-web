import { Button, Group, TextInput } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useTaskActions } from '@/store/taskStore'

interface Props {
	returnTo: string
}

export function DirectTaskForm({ returnTo }: Props) {
	const { t } = useTranslation()
	const [value, setValue] = useState('')
	const { addTask } = useTaskActions()
	const navigate = useNavigate()

	function handleAdd() {
		if (!value.trim()) return
		addTask({ title: value.trim(), status: 'inbox' })
		setValue('')
		navigate({ to: '/process-inbox', search: { returnTo } })
	}

	return (
		<Group gap="xs">
			<TextInput
				flex={1}
				placeholder={t('weeklyReview.taskPlaceholder')}
				value={value}
				onChange={(e) => setValue(e.currentTarget.value)}
				onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
			/>
			<Button onClick={handleAdd} disabled={!value.trim()}>
				{t('weeklyReview.addTask')}
			</Button>
		</Group>
	)
}
