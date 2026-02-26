import { Button, Stack } from '@mantine/core'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { goToInboxStep, patchInboxState } from '@/store/inboxStepper'

type Props = {
	projects: { id: string; title: string }[]
}

export function SelectProjectStep({ projects }: Props) {
	const { t } = useTranslation()
	return (
		<Stack gap="sm">
			<Button
				onClick={() => goToInboxStep('4_1_1_new_project')}
				variant="light"
				color="blue"
				fullWidth
			>
				{t('processNewProjectUk')}
			</Button>
			{projects.map((p) => (
				<Button
					key={p.id}
					onClick={() => {
						patchInboxState({ selectedProjectId: p.id })
						goToInboxStep('4_1_2_existing_project')
					}}
					variant="light"
					color="teal"
					fullWidth
				>
					{p.title}
				</Button>
			))}
			<Button
				onClick={() => goToInboxStep('4_0_is_project')}
				variant="subtle"
				color="gray"
				fullWidth
				leftSection={<ArrowLeft size={14} />}
			>
				{t('processBackUk')}
			</Button>
		</Stack>
	)
}
