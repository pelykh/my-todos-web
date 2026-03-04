import type { isTaskImportant } from '@/utils/tasks'

export type TaskStatus =
	| 'inbox'
	| 'next_action'
	| 'backlog'
	| 'waiting_for'
	| 'someday'
	| 'done'
	| 'deleted'

export type Context = 'deep_work' | 'admin' | 'home' | 'agenda'

export const AREAS = ['personal', 'child', 'finances', 'work', 'learning'] as const
export type Area = (typeof AREAS)[number]

export type Task = {
	id: string
	title: string
	notes?: string

	status: TaskStatus

	context?: Context
	area?: Area

	projectId?: string
	isProject?: boolean

	scheduledDate?: string
	dueDate?: string
	estimatedMinutes?: number

	waitingSince?: string

	createdAt: string
	updatedAt: string
	completedAt?: string
}

export type TaskFilters = Partial<
	Pick<Task, 'status' | 'context' | 'area' | 'projectId'>
> & {
	maxEstimatedMinutes?: number
	isImportant?: boolean
	isProject?: boolean
	excludeFutureScheduled?: boolean
}
