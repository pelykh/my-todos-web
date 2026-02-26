import { Button, Group, Modal, TextInput } from '@mantine/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useTaskActions } from '@/store/taskStore'

type SimpleTaskModalProps = {
	open: boolean
	onClose: () => void
	projectId: string
}

export function SimpleTaskModal({
	open,
	onClose,
	projectId,
}: SimpleTaskModalProps) {
	const { t } = useTranslation()
	const { addTask } = useTaskActions()
	const [title, setTitle] = useState('')

	function handleAdd() {
		const trimmed = title.trim()
		if (!trimmed) return
		addTask({ title: trimmed, status: 'backlog', projectId })
		setTitle('')
		onClose()
	}

	function handleClose() {
		setTitle('')
		onClose()
	}

	return (
		<Modal
			opened={open}
			onClose={handleClose}
			title={t('simpleTaskModalTitle')}
			size="sm"
			radius="md"
		>
			<TextInput
				placeholder={t('simpleTaskModalPlaceholder')}
				value={title}
				onChange={(e) => setTitle(e.currentTarget.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') handleAdd()
					if (e.key === 'Escape') handleClose()
				}}
				autoFocus
				mb="sm"
			/>
			<Group justify="flex-end">
				<Button onClick={handleAdd} disabled={!title.trim()}>
					{t('addButton')}
				</Button>
			</Group>
		</Modal>
	)
}
