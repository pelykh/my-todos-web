import {
  LocalStorageTaskService,
  type CreateTaskInput,
  type ITaskService,
  type UpdateTaskInput
} from "@/services";
import type { Task, TaskFilters } from "@/types";
import { getTaskProject, isTaskImportant } from "@/utils/tasks";
import React from "react";
import { createStore, useStore } from "zustand";
import { useShallow } from "zustand/shallow";

export type TaskActions = {
  addTask: (input: CreateTaskInput) => Task;
  editTask: (id: string, input: UpdateTaskInput) => Task;
  removeTask: (id: string) => void;
};

export type TaskState = {
  tasks: Task[];
  actions: TaskActions;
};

export function createTaskStore(service: ITaskService) {
  return createStore<TaskState>()((set) => ({
    tasks: service.getTasks(),
    actions: {
      addTask(input) {
        const task = service.createTask(input);
        set((s) => ({ tasks: [...s.tasks, task] }));
        return task;
      },
      editTask(id, input) {
        const task = service.updateTask(id, input);
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }));
        return task;
      },
      removeTask(id) {
        service.deleteTask(id);
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },
    },
  }));
}

export type TaskStore = ReturnType<typeof createTaskStore>;


function applyFilters(
	tasks: Task[],
	filters?: TaskFilters,
) {
	if (!filters) return tasks
  return tasks.filter((t) => {
		if (filters.status !== undefined && t.status !== filters.status)
			return false
		if (filters.context !== undefined && t.context !== filters.context)
			return false
		if (filters.area !== undefined && t.area !== filters.area) return false
		if (filters.projectId !== undefined && t.projectId !== filters.projectId)
			return false
		if (
			filters.maxEstimatedMinutes !== undefined &&
			(t.estimatedMinutes === undefined || t.estimatedMinutes > filters.maxEstimatedMinutes)
		)
      return false

    if (filters.isImportant) {
      return isTaskImportant(t, getTaskProject(t,tasks))
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
    return tasks.reduce<GroupedTasks>((acc, task) => {
      acc['important'] ??= []

      if (useImportant) {
        const allTasks =taskStore.getState().tasks
        const project = getTaskProject(task, allTasks)
        if (isTaskImportant(task, project)) {
          acc['important'].push(task)
          return acc
        }
      }

      const key = (groupBy && task[groupBy]) ?? 'other'
      acc[key] ??= []
      acc[key].push(task)
      return acc
    }, {})
  }, [tasks])
}

export function useTaskWithProject(id: string): [Task, Task | undefined] {
	return useStore(taskStore, useShallow((s) => {
		const task = s.tasks.find((t) => t.id === id)
		if (!task) return [task, undefined] as never
		if (!task?.projectId) return [task, undefined]
		const project = s.tasks.find((t) => t.id === task.projectId)
		return [task, project]
	}))
}

export function useTaskActions(): TaskActions {
	return useStore(taskStore, (s) => s.actions)
}
