import { Stack, TextInput } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ShortcutButton } from '@/components/ShortcutButton'
import { TaskCard } from '@/components/TaskCard'
import { TaskListItem } from '@/components/TaskListItem'
import { goToInboxStep, patchInboxState } from '@/store/inboxStepper'
import type { Task } from '@/types'

type Props = {
	task: { title: string; notes?: string }
	projects: Task[]
}

export function SelectProjectStep({ task, projects }: Props) {
	const { t } = useTranslation()
	const [query, setQuery] = useState('')

	const filtered = projects
		.filter((p) => {
			const q = query.toLowerCase()
			return (
				p.title.toLowerCase().includes(q) ||
				(p.area ?? '').toLowerCase().includes(q)
			)
		})
		.slice(0, 10)

	return (
		<Stack gap="sm" align="center">
			<TaskCard task={task} />
			<TextInput
				placeholder={t('filterProjects')}
				value={query}
				onChange={(e) => setQuery(e.currentTarget.value)}
				w="100%"
			/>
			<Stack gap={0} w="100%">
				{filtered.map((p) => (
					<TaskListItem
						key={p.id}
						taskId={p.id}
						displayMeta={['area']}
						onClick={() => {
							patchInboxState({ selectedProjectId: p.id })
							goToInboxStep('4_1_2_existing_project')
						}}
					/>
				))}
			</Stack>
			<ShortcutButton
				shortcut="1"
				onClick={() => goToInboxStep('4_1_1_new_project')}
				variant="light"
				color="blue"
				w="100%"
				maw={320}
			>
				{t('processNewProjectUk')}
			</ShortcutButton>
			<ShortcutButton
				shortcut="2"
				onClick={() => goToInboxStep('4_0_is_project')}
				variant="subtle"
				color="gray"
				w="100%"
				maw={320}
				leftSection={<ArrowLeft size={14} />}
			>
				{t('processBackUk')}
			</ShortcutButton>
		</Stack>
	)
}
