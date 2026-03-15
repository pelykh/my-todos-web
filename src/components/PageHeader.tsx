import { ActionIcon, Group, Text } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isMobile } from '@/utils'

import { OverflowMenu } from './OverflowMenu'
import { SettingsModal } from './SettingsModal'

interface PageHeaderProps {
	title: string
}

export function PageHeader({ title }: PageHeaderProps) {
	const { t } = useTranslation()
	const [settingsOpen, setSettingsOpen] = useState(false)

	return (
		<>
			<Group
				style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '16px 16px 0' }}
				justify="space-between"
			>
				{isMobile() && (
					<Text fw={600} size="sm">
						{title}
					</Text>
				)}
				<Group gap="xs" ml="auto">
					<ActionIcon
						component={Link}
						to="/"
						variant="default"
						size="lg"
						radius="md"
						aria-label={t('back')}
					>
						<ArrowLeft size={18} />
					</ActionIcon>
					<OverflowMenu onSettings={() => setSettingsOpen(true)} />
				</Group>
			</Group>
			<SettingsModal
				opened={settingsOpen}
				onClose={() => setSettingsOpen(false)}
				onLoginRequest={() => {}}
			/>
		</>
	)
}
