import type { Task } from '@/types'

function isTodayOrPast(date: string): boolean {
	return date <= new Date().toISOString().slice(0, 10)
}

function hasImportantDate(t: Task): boolean {
	return (
		(!!t.dueDate && isTodayOrPast(t.dueDate)) ||
		(!!t.scheduledDate && isTodayOrPast(t.scheduledDate))
	)
}

export function isTaskImportant(
	task: Task,
	project: Task | undefined,
): boolean {
	return (project ? hasImportantDate(project) : false) || hasImportantDate(task)
}

export function getTaskProject(task: Task, allTasks: Task[]) {
	if (!task?.projectId) return undefined
	return allTasks.find((t) => t.id === task.projectId)
}

export function getTaskArea(task: Task, allTasks: Task[]) {
	const project = getTaskProject(task, allTasks)
	return project?.area ?? task.area
}
