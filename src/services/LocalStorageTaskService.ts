import type { Task } from '@/types'

import type {
	CreateTaskInput,
	ITaskService,
	TaskFilters,
	UpdateTaskInput,
} from './TaskService'

export const STORAGE_KEY = 'tasks'

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
	return new Date().toISOString()
}

function loadTasks(): Task[] {
	const raw = localStorage.getItem(STORAGE_KEY)
	if (!raw) return []
	try {
		return JSON.parse(raw) as Task[]
	} catch {
		return []
	}
}

function saveTasks(tasks: Task[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export class LocalStorageTaskService implements ITaskService {
	getTasks(filters?: TaskFilters): Task[] {
		let tasks = loadTasks()

		if (!filters) return tasks

		if (filters.status !== undefined) {
			tasks = tasks.filter((t) => t.status === filters.status)
		}
		if (filters.context !== undefined) {
			tasks = tasks.filter((t) => t.context === filters.context)
		}
		if (filters.area !== undefined) {
			tasks = tasks.filter((t) => t.area === filters.area)
		}
		if (filters.projectId !== undefined) {
			tasks = tasks.filter((t) => t.projectId === filters.projectId)
		}
		if (filters.isProject !== undefined) {
			tasks = tasks.filter((t) => t.isProject === filters.isProject)
		}

		return tasks
	}

	getTaskById(id: string): Task | undefined {
		return loadTasks().find((t) => t.id === id)
	}

	createTask(input: CreateTaskInput): Task {
		const tasks = loadTasks()
		const task: Task = {
			...input,
			id: generateId(),
			createdAt: now(),
			updatedAt: now(),
		}
		saveTasks([...tasks, task])
		return task
	}

	updateTask(id: string, input: UpdateTaskInput): Task {
		const tasks = loadTasks()
		const index = tasks.findIndex((t) => t.id === id)
		if (index === -1) throw new Error(`Task not found: ${id}`)

		const updated: Task = {
			...tasks[index],
			...input,
			id,
			updatedAt: now(),
		}
		tasks[index] = updated
		saveTasks(tasks)
		return updated
	}

	deleteTask(id: string): void {
		const tasks = loadTasks()
		saveTasks(tasks.filter((t) => t.id !== id))
	}
}
