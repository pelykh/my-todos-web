import { createStore } from "zustand";
import type {
  CreateTaskInput,
  ITaskService,
  TaskFilters,
  UpdateTaskInput,
} from "@/services";
import type { Task } from "@/types";

export type TaskActions = {
  loadTasks: (filters?: TaskFilters) => void;
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
      loadTasks(filters) {
        set({ tasks: service.getTasks(filters) });
      },

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
