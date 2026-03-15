import React from 'react'
import { createStore, useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'

import {
  type CreateTaskInput,
  type ITaskService,
  LocalStorageTaskService,
  type UpdateTaskInput,
} from '@/services'
import type { Task, TaskFilters } from '@/types'
import { timerStore } from '@/store/timerStore'
import { AREAS } from '@/types'
import { getTaskArea, getTaskProject, isTaskImportant } from '@/utils/tasks'

export type TaskActions = {
	addTask: (input: CreateTaskInput) => Task
	editTask: (id: string, input: UpdateTaskInput) => Task
	removeTask: (id: string) => void
	clearPendingSync: () => void
}

export type TaskState = {
	tasks: Task[]
	pendingSync: Task[]
	actions: TaskActions
}

function upsertPending(pending: Task[], task: Task): Task[] {
	return [...pending.filter((t) => t.id !== task.id), task]
}

export function createTaskStore(service: ITaskService) {
	return createStore<TaskState>()((set) => ({
		tasks: service.getTasks(),
		pendingSync: [],
		actions: {
			addTask(input) {
				const task = service.createTask(input)
				set((s) => ({ tasks: [...s.tasks, task], pendingSync: upsertPending(s.pendingSync, task) }))
				return task
			},
			editTask(id, input) {
				const task = service.updateTask(id, input)
				if (input.status === 'done' && timerStore.getState().focusedTaskId === id) {
					timerStore.getState().actions.resetTimer()
					timerStore.getState().actions.setFocusedTaskId(null)
				}
				set((s) => ({
					tasks: s.tasks.map((t) => (t.id === id ? task : t)),
					pendingSync: upsertPending(s.pendingSync, task),
				}))
				return task
			},
			removeTask(id) {
				service.deleteTask(id)
				if (timerStore.getState().focusedTaskId === id) {
					timerStore.getState().actions.resetTimer()
					timerStore.getState().actions.setFocusedTaskId(null)
				}
				set((s) => {
					const task = s.tasks.find((t) => t.id === id)
					const deletedEntry = task
						? { ...task, status: 'deleted' as const, updatedAt: new Date().toISOString() }
						: null
					return {
						tasks: s.tasks.filter((t) => t.id !== id),
						pendingSync: deletedEntry
							? upsertPending(s.pendingSync.filter((t) => t.id !== id), deletedEntry)
							: s.pendingSync.filter((t) => t.id !== id),
					}
				})
			},
			clearPendingSync() {
				set({ pendingSync: [] })
			},
		},
	}))
}

export type TaskStore = ReturnType<typeof createTaskStore>

function applyFilters(tasks: Task[], filters?: TaskFilters) {
	if (!filters) return tasks
	return tasks.filter((t) => {
		if (filters.status !== undefined && t.status !== filters.status)
			return false
		if (filters.excludeStatuses?.includes(t.status)) return false
		if (filters.context !== undefined && t.context !== filters.context)
			return false
		if (filters.area !== undefined && t.area !== filters.area) return false
		if (filters.projectId !== undefined && t.projectId !== filters.projectId)
			return false
		if (filters.isProject !== undefined && !!t.isProject !== filters.isProject)
			return false
		if (
			filters.maxEstimatedMinutes !== undefined &&
			(t.estimatedMinutes === undefined ||
				t.estimatedMinutes > filters.maxEstimatedMinutes)
		)
			return false

		if (filters.excludeFutureScheduled) {
			const today = new Date().toISOString().slice(0, 10)
			if (t.scheduledDate && t.scheduledDate > today) return false
		}
		if (filters.tags?.length && !filters.tags.every((tag) => t.tags?.includes(tag)))
			return false
		if (filters.isImportant) {
			return isTaskImportant(t, getTaskProject(t, tasks))
		}
		return true
	})
}

export const taskStore = createTaskStore(new LocalStorageTaskService())

type SortBy = 'duration' | 'createdAt' | 'updatedAt'
type SortOrder = 'asc' | 'desc'

function applySorting(tasks: Task[], sort?: { sortBy?: SortBy; sortOrder?: SortOrder }): Task[] {
	if (!sort?.sortBy) return tasks
	const { sortBy, sortOrder = 'asc' } = sort
	return [...tasks].sort((a, b) => {
		let aVal: number
		let bVal: number
		if (sortBy === 'duration') {
			aVal = a.estimatedMinutes ?? 0
			bVal = b.estimatedMinutes ?? 0
		} else {
			aVal = new Date(a[sortBy]).getTime()
			bVal = new Date(b[sortBy]).getTime()
		}
		return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
	})
}

export function useFilteredTasks(filters?: TaskFilters, sort?: { sortBy?: SortBy; sortOrder?: SortOrder }) {
	return useStore(
		taskStore,
		useShallow((s) => applySorting(applyFilters(s.tasks, filters), sort)),
	)
}

export type GroupedTasks = Record<string, Task[]>

export function useGroupedFilteredTasks({
	filters,
	groupBy,
	useImportant = false,
	sort,
}: {
	filters?: TaskFilters
	groupBy?: 'area' | 'context'
	useImportant?: boolean
	sort?: { sortBy?: SortBy; sortOrder?: SortOrder }
}): GroupedTasks {
	const tasks = useFilteredTasks(filters, sort)

	return React.useMemo(() => {
		const seed: GroupedTasks = { important: [] }
		if (groupBy === 'area') {
			for (const area of AREAS) seed[area] = []
		}

		return tasks.reduce<GroupedTasks>((acc, task) => {
			acc['important'] ??= []

			if (useImportant) {
				const allTasks = taskStore.getState().tasks
				const project = getTaskProject(task, allTasks)
				if (isTaskImportant(task, project)) {
					acc['important'].push(task)
					return acc
				}
			}

			if (groupBy === 'area') {
				const allTasks = taskStore.getState().tasks
				const key = getTaskArea(task, allTasks) ?? 'other'
				acc[key] ??= []
				acc[key].push(task)
				return acc
			}

			const key = (groupBy && task[groupBy]) ?? 'other'
			acc[key] ??= []
			acc[key].push(task)
			return acc
		}, seed)
	}, [tasks, groupBy, useImportant])
}

export function useTaskWithProject(id: string): [Task, Task | undefined] {
	return useStore(
		taskStore,
		useShallow((s) => {
			const task = s.tasks.find((t) => t.id === id)
			if (!task) return [task, undefined] as never
			if (!task?.projectId) return [task, undefined]
			const project = s.tasks.find((t) => t.id === task.projectId)
			return [task, project]
		}),
	)
}

export function useTaskById(id: string | null): Task | null {
	return useStore(taskStore, (s) =>
		id ? (s.tasks.find((t) => t.id === id) ?? null) : null,
	)
}

export function useTaskActions(): TaskActions {
	return useStore(taskStore, (s) => s.actions)
}
