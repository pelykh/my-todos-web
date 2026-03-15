import { Container, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/PageHeader'
import { TaskListItem } from '@/components/TaskListItem'
import { useFilteredTasks } from '@/store/taskStore'
import type { Task } from '@/types'
import { AREAS } from '@/types'
import { isMobile } from '@/utils'

export const Route = createFileRoute('/projects')({ component: ProjectsPage })

function ProjectsPage() {
	const { t } = useTranslation()
	const navigate = useNavigate()

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') navigate({ to: '/' })
		}
		window.addEventListener('keydown', handleKey)
		return () => window.removeEventListener('keydown', handleKey)
	}, [])

	const projects = useFilteredTasks({ isProject: true })
	const active = projects.filter((p) => p.status !== 'done' && p.status !== 'deleted')

	const grouped: Record<string, Task[]> = {}
	for (const area of AREAS) grouped[area] = []
	grouped['other'] = []

	for (const project of active) {
		const key = project.area ?? 'other'
		;(grouped[key] ??= []).push(project)
	}

	return (
		<>
			<PageHeader title={t('navProjects', { defaultValue: 'Projects' })} />
			<Container size="sm" py="xl" pt={64} pb="xl">
				<Stack gap="lg">
					{!isMobile() && (
						<Title order={2} ta="center">
							{t('navProjects', { defaultValue: 'Projects' })}
						</Title>
					)}
					{Object.entries(grouped).map(([area, areaProjects]) => {
						if (areaProjects.length === 0) return null
						return (
							<Stack key={area} gap={0}>
								<Text
									size="xs"
									fw={600}
									tt="uppercase"
									style={{
										letterSpacing: '0.05em',
										padding: '0 8px',
										marginBottom: 2,
										color: 'var(--mantine-color-dimmed)',
									}}
								>
									{t(`area.${area}`, { defaultValue: area })}
								</Text>
								{areaProjects.map((project) => (
									<TaskListItem
										key={project.id}
										taskId={project.id}
										displayMeta={[]}
										href={`/project/${project.id}`}
									/>
								))}
							</Stack>
						)
					})}
					{active.length === 0 && (
						<Text c="dimmed" ta="center" size="sm">
							{t('noTasks')}
						</Text>
					)}
				</Stack>
			</Container>
		</>
	)
}
