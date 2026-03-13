import type { Area, Context, Task, TaskStatus } from '@/types'

export type TaskFilters = {
	status?: TaskStatus
	context?: Context
	area?: Area
	projectId?: string
	isProject?: boolean
	maxDuration?: number
}

export type CreateTaskInput = {
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
	tags?: string[]
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
	completedAt?: string
}

export interface ITaskService {
	getTasks(filters?: TaskFilters): Task[]
	getTaskById(id: string): Task | undefined
	createTask(input: CreateTaskInput): Task
	updateTask(id: string, input: UpdateTaskInput): Task
	deleteTask(id: string): void
}
