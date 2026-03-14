import { Tooltip } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { useTaskWithProject } from '@/store/taskStore'
import { cn } from '@/utils/cn'
import { formatDuration } from '@/utils/duration'
import { isTaskImportant } from '@/utils/tasks'

type DisplayMeta = 'area' | 'duration' | 'project' | 'context' | 'due_date' | 'waiting_since' | 'notes'

type TaskListItemProps = {
	taskId: string
	status?: 'important'
	displayMeta?: DisplayMeta[]
	href?: string
	onClick?: () => void
}

export function TaskListItem({
	taskId,
	status,
	displayMeta = ['project', 'duration'],
	href,
	onClick,
}: TaskListItemProps) {
	const { t } = useTranslation()
	const [task, project] = useTaskWithProject(taskId)
	if (!task) return null

	const isImportant = status === 'important' || isTaskImportant(task, project)

	const getMetaLabel = (metaKey: DisplayMeta) => {
		if (metaKey === 'area') {
			return task.area ? t(`area.${task.area}`, { defaultValue: task.area }) : null
		}

		if (metaKey === 'duration') {
			return task.estimatedMinutes
				? formatDuration(
						task.estimatedMinutes,
						t('hourSuffix'),
						t('minutesSuffix'),
					)
				: null
		}

		if (metaKey === 'project') {
			return project?.title
		}

		if (metaKey === 'context') {
			return project?.context
		}
	}

	const className = cn(
		'group flex items-center gap-1.5 md:gap-2.5 px-1 md:px-2 py-1.5 rounded-md cursor-pointer select-none transition-[background] duration-100 my-px hover:bg-(--mantine-color-default-hover)',
	)

	const content = (
		<>
			{/* Status dot */}
			<div className="flex items-center justify-center w-5 shrink-0">
				<div
					className={cn(
						'w-1.5 h-1.5 rounded-[1.5px] shrink-0 transition-[transform,background-color] duration-100 group-hover:scale-[1.3]',
						isImportant
							? 'bg-(--mantine-color-orange-6)'
							: 'bg-[rgb(216,216,212)]',
					)}
				/>
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0 flex items-center justify-between gap-3">
				<Tooltip label={task.title} openDelay={600} withinPortal>
					<span className="flex-1 min-w-0 text-[13.5px] font-normal truncate text-(--mantine-color-text)">
						{task.title}
					</span>
				</Tooltip>

				<div className="flex items-center gap-1.5 shrink-0">
					{displayMeta?.map((metaKey) => {
						if (metaKey === 'waiting_since') {
							if (!task.waitingSince) return null
							const days = Math.floor(
								(Date.now() - new Date(task.waitingSince).getTime()) / 86_400_000,
							)
							const color =
								days >= 14
									? 'var(--mantine-color-orange-6)'
									: days >= 7
										? 'var(--mantine-color-yellow-6)'
										: 'var(--mantine-color-dimmed)'
							const label =
								days === 0
									? t('waitingSinceToday')
									: days >= 14
										? t('waitingSinceWeeks', { weeks: Math.floor(days / 7) })
										: t('waitingSince', { days })
							return (
								<span key={metaKey} className="text-xs" style={{ color }}>
									{label}
								</span>
							)
						}

						if (metaKey === 'notes') {
							if (!task.notes) return null
							return (
								<Tooltip key={metaKey} label={task.notes} openDelay={600} withinPortal>
									<span className="text-xs text-(--mantine-color-dimmed) max-w-[150px] truncate block">
										{task.notes}
									</span>
								</Tooltip>
							)
						}

						const label = getMetaLabel(metaKey)
						if (!label) return null

						if (metaKey === 'project') {
							return (
								<Tooltip key={metaKey} label={label} openDelay={600} withinPortal>
									<span className="text-xs text-gray-400 max-w-[130px] truncate block">
										{label}
									</span>
								</Tooltip>
							)
						}

						return (
							<span key={metaKey} className="text-xs text-gray-400">
								{label}
							</span>
						)
					})}
				</div>
			</div>
		</>
	)

	if (href) {
		return (
			<Link
				to={href}
				className={className}
				onClick={onClick}
			>
				{content}
			</Link>
		)
	}

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') onClick?.()
			}}
			className={className}
		>
			{content}
		</div>
	)
}
