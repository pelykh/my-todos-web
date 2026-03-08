import { ActionIcon, Container, Group, Stack, Text, Title } from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TaskListItem } from '@/components/TaskListItem'
import { Toolbar } from '@/components/Toolbar'
import { useFilteredTasks } from '@/store/taskStore'
import type { Task } from '@/types'
import { AREAS } from '@/types'

export const Route = createFileRoute('/projects')({ component: ProjectsPage })

function ProjectsPage() {
	const { t } = useTranslation()
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
			<Group style={{ position: 'fixed', top: 16, left: 16, zIndex: 200 }}>
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
			</Group>
			<Container size="sm" py="xl" pb={120}>
				<Stack gap="lg">
					<Title order={2} ta="center">
						{t('navProjects', { defaultValue: 'Projects' })}
					</Title>
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
