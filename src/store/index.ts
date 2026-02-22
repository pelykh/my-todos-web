import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { createTaskStore } from './taskStore'
import { LocalStorageTaskService } from '@/services'
import type { TaskFilters } from '@/services'
import type { TaskActions } from './taskStore'
import { filterStore } from './filterStore'
import type { FilterActions, FilterState, DurationStep } from './filterStore'
import { MOCK_TASKS } from '@/mockData'

const SEEDED_KEY = 'tasks_seeded'

function seedIfEmpty() {
  if (localStorage.getItem(SEEDED_KEY)) return
  localStorage.setItem('tasks', JSON.stringify(MOCK_TASKS))
  localStorage.setItem(SEEDED_KEY, '1')
}

seedIfEmpty()
const taskStore = createTaskStore(new LocalStorageTaskService())

function applyFilters(
  tasks: ReturnType<typeof taskStore.getState>['tasks'],
  filters?: TaskFilters,
) {
  if (!filters) return tasks
  return tasks.filter((t) => {
    if (filters.status !== undefined && t.status !== filters.status) return false
    if (filters.context !== undefined && t.context !== filters.context) return false
    if (filters.area !== undefined && t.area !== filters.area) return false
    if (filters.projectId !== undefined && t.projectId !== filters.projectId) return false
    if (filters.isProject !== undefined && t.isProject !== filters.isProject) return false
    return true
  })
}

export function useTasks(filters?: TaskFilters) {
  return useStore(taskStore, useShallow((s) => applyFilters(s.tasks, filters)))
}

export function useTask(id: string) {
  return useStore(taskStore, (s) => s.tasks.find((t) => t.id === id))
}

export function useTaskActions(): TaskActions {
  return useStore(taskStore, (s) => s.actions)
}

// ── Filter store hooks ────────────────────────────────────────────────────────

export function useFilters(): FilterState {
  return useStore(
    filterStore,
    useShallow((s) => ({
      context: s.context,
      todayOnly: s.todayOnly,
      maxMinutes: s.maxMinutes,
    })),
  )
}

export function useFilterActions(): FilterActions {
  return useStore(filterStore, (s) => s.actions)
}

export type { FilterState, FilterActions, DurationStep }
export { DURATION_STEPS } from './filterStore'
