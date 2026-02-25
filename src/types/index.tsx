import type { isTaskImportant } from "@/utils/tasks";

export type TaskStatus =
  | "inbox"
  | "next_action"
  | "backlog"
  | "waiting_for"
  | "someday"
  | "reference"
  | "done";

export type Context = "deep_work" | "admin" | "home" | "agenda";

export type Area = "work" | "personal" | "health" | "learning";

export type Task = {
  id: string;
  title: string;
  notes?: string;

  status: TaskStatus;

  context?: Context;
  area?: Area;

  projectId?: string;
  isProject?: boolean;

  scheduledDate?: string;
  dueDate?: string;
  estimatedMinutes?: number;

  waitingSince?: string;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type TaskFilters = Partial<Pick<Task, 'status' |'context' | 'area' | 'projectId'>> & {
  maxEstimatedMinutes?: number
  isImportant?: boolean
}
