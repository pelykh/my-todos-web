import type { Task } from '@/types'

const d = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

const due = (daysFromNow: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().slice(0, 10)
}

const TODAY = due(0)

export const MOCK_TASKS: Task[] = [
  // ── Projects ──────────────────────────────────────────────────────────────
  {
    id: 'proj-1',
    title: 'Launch personal website',
    status: 'next_action',
    area: 'personal',
    isProject: true,
    dueDate: due(14),
    estimatedMinutes: 600,
    createdAt: d(10),
    updatedAt: d(10),
  },
  {
    id: 'proj-2',
    title: 'Q1 performance review',
    status: 'next_action',
    area: 'work',
    isProject: true,
    dueDate: due(7),
    estimatedMinutes: 180,
    createdAt: d(5),
    updatedAt: d(5),
  },
  {
    id: 'proj-3',
    title: 'Update CI pipeline',
    status: 'next_action',
    area: 'work',
    isProject: true,
    estimatedMinutes: 240,
    createdAt: d(3),
    updatedAt: d(3),
  },

  // ── Next actions – Work ───────────────────────────────────────────────────
  {
    id: 'task-1',
    title: 'Gather peer feedback for review',
    status: 'next_action',
    area: 'work',
    context: 'admin',
    projectId: 'proj-2',
    estimatedMinutes: 45,
    dueDate: due(5),
    createdAt: d(4),
    updatedAt: d(4),
  },
  {
    id: 'task-2',
    title: 'Review pull request #142',
    status: 'next_action',
    area: 'work',
    context: 'deep_work',
    estimatedMinutes: 30,
    scheduledDate: TODAY,
    createdAt: d(1),
    updatedAt: d(1),
  },
  {
    id: 'task-3',
    title: 'Update API documentation',
    status: 'next_action',
    area: 'work',
    context: 'deep_work',
    projectId: 'proj-3',
    estimatedMinutes: 60,
    createdAt: d(2),
    updatedAt: d(2),
  },
  {
    id: 'task-4',
    title: 'Send weekly status report',
    status: 'next_action',
    area: 'work',
    context: 'admin',
    estimatedMinutes: 15,
    dueDate: TODAY,
    createdAt: d(1),
    updatedAt: d(1),
  },
  {
    id: 'task-5',
    title: 'Schedule 1-on-1 with manager',
    status: 'next_action',
    area: 'work',
    context: 'admin',
    estimatedMinutes: 5,
    createdAt: d(3),
    updatedAt: d(3),
  },
  {
    id: 'task-6',
    title: 'Migrate DB schema to v2',
    status: 'next_action',
    area: 'work',
    context: 'deep_work',
    projectId: 'proj-3',
    estimatedMinutes: 120,
    createdAt: d(2),
    updatedAt: d(2),
  },

  // ── Next actions – Personal ───────────────────────────────────────────────
  {
    id: 'task-7',
    title: 'Write homepage copy',
    status: 'next_action',
    area: 'personal',
    context: 'deep_work',
    projectId: 'proj-1',
    estimatedMinutes: 90,
    createdAt: d(9),
    updatedAt: d(9),
  },
  {
    id: 'task-8',
    title: 'Deploy to Vercel',
    status: 'next_action',
    area: 'personal',
    context: 'admin',
    projectId: 'proj-1',
    estimatedMinutes: 30,
    createdAt: d(8),
    updatedAt: d(8),
  },
  {
    id: 'task-9',
    title: 'Call insurance about claim',
    status: 'next_action',
    area: 'personal',
    context: 'admin',
    estimatedMinutes: 20,
    scheduledDate: TODAY,
    createdAt: d(2),
    updatedAt: d(2),
  },
  {
    id: 'task-10',
    title: 'Buy birthday gift for mom',
    status: 'next_action',
    area: 'personal',
    context: 'home',
    estimatedMinutes: 15,
    dueDate: due(3),
    createdAt: d(1),
    updatedAt: d(1),
  },

  // ── Next actions – Health ─────────────────────────────────────────────────
  {
    id: 'task-11',
    title: 'Morning run 5k',
    status: 'next_action',
    area: 'health',
    context: 'home',
    estimatedMinutes: 35,
    scheduledDate: TODAY,
    createdAt: d(2),
    updatedAt: d(2),
  },
  {
    id: 'task-12',
    title: 'Book dentist appointment',
    status: 'next_action',
    area: 'health',
    context: 'admin',
    estimatedMinutes: 10,
    createdAt: d(5),
    updatedAt: d(5),
  },
  {
    id: 'task-13',
    title: 'Meal prep for the week',
    status: 'next_action',
    area: 'health',
    context: 'home',
    estimatedMinutes: 60,
    scheduledDate: TODAY,
    createdAt: d(1),
    updatedAt: d(1),
  },

  // ── Next actions – Learning ───────────────────────────────────────────────
  {
    id: 'task-14',
    title: 'Finish TypeScript generics chapter',
    status: 'next_action',
    area: 'learning',
    context: 'deep_work',
    estimatedMinutes: 45,
    scheduledDate: TODAY,
    createdAt: d(3),
    updatedAt: d(3),
  },
  {
    id: 'task-15',
    title: 'Watch talk on React compiler',
    status: 'next_action',
    area: 'learning',
    context: 'home',
    estimatedMinutes: 40,
    createdAt: d(2),
    updatedAt: d(2),
  },

  // ── Inbox ─────────────────────────────────────────────────────────────────
  {
    id: 'task-16',
    title: 'Look into Rust for backend',
    status: 'inbox',
    notes: 'Saw a talk about Axum, might be worth exploring',
    createdAt: d(1),
    updatedAt: d(1),
  },
  {
    id: 'task-17',
    title: 'Fix flaky test in auth module',
    status: 'inbox',
    area: 'work',
    createdAt: d(3),
    updatedAt: d(3),
  },

  // ── Waiting For ───────────────────────────────────────────────────────────
  {
    id: 'task-18',
    title: 'Design mockups from contractor',
    status: 'waiting_for',
    area: 'personal',
    projectId: 'proj-1',
    waitingSince: d(6),
    notes: 'Sent brief to Anna on Monday',
    createdAt: d(7),
    updatedAt: d(6),
  },
  {
    id: 'task-19',
    title: 'HR to confirm promotion decision',
    status: 'waiting_for',
    area: 'work',
    waitingSince: d(3),
    createdAt: d(4),
    updatedAt: d(3),
  },

  // ── Someday ───────────────────────────────────────────────────────────────
  {
    id: 'task-20',
    title: 'Learn Spanish — Duolingo streak',
    status: 'someday',
    area: 'learning',
    context: 'home',
    createdAt: d(20),
    updatedAt: d(20),
  },
  {
    id: 'task-21',
    title: 'Read "Deep Work" by Cal Newport',
    status: 'someday',
    area: 'learning',
    context: 'home',
    createdAt: d(15),
    updatedAt: d(15),
  },

  // ── Done ──────────────────────────────────────────────────────────────────
  {
    id: 'task-22',
    title: 'Set up project repo',
    status: 'done',
    area: 'personal',
    projectId: 'proj-1',
    createdAt: d(12),
    updatedAt: d(11),
    completedAt: d(11),
  },
  {
    id: 'task-23',
    title: 'Buy standing desk mat',
    status: 'done',
    area: 'health',
    context: 'home',
    createdAt: d(8),
    updatedAt: d(7),
    completedAt: d(7),
  },
]
