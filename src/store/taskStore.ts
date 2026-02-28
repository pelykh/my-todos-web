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
import { AREAS } from '@/types'
import { getTaskArea, getTaskProject, isTaskImportant } from '@/utils/tasks'

export type TaskActions = {
	addTask: (input: CreateTaskInput) => Task
	editTask: (id: string, input: UpdateTaskInput) => Task
	removeTask: (id: string) => void
}

export type TaskState = {
	tasks: Task[]
	actions: TaskActions
}

export function createTaskStore(service: ITaskService) {
	return createStore<TaskState>()((set) => ({
		tasks: service.getTasks(),
		actions: {
			addTask(input) {
				const task = service.createTask(input)
				set((s) => ({ tasks: [...s.tasks, task] }))
				return task
			},
			editTask(id, input) {
				const task = service.updateTask(id, input)
				set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }))
				return task
			},
			removeTask(id) {
				service.deleteTask(id)
				set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
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
		if (filters.isImportant) {
			return isTaskImportant(t, getTaskProject(t, tasks))
		}
		return true
	})
}

const taskStore = createTaskStore(new LocalStorageTaskService())

export function useFilteredTasks(filters?: TaskFilters) {
	return useStore(
		taskStore,
		useShallow((s) => applyFilters(s.tasks, filters)),
	)
}

export type GroupedTasks = Record<string, Task[]>

export function useGroupedFilteredTasks({
	filters,
	groupBy,
	useImportant = false,
}: {
	filters?: TaskFilters
	groupBy?: 'area' | 'context'
	useImportant?: boolean
}): GroupedTasks {
	const tasks = useFilteredTasks(filters)

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
	}, [tasks])
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
