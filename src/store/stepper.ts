//
//
// Stepper store

import type { Task } from '@/types'

const step = {
	key: 'is_less_then_2_mins',
	component: 'ReactComponent', // Actual component
}

// In each component you can updateTask and then more to next step. On some steps, you don't change anything, like when saying that task takes less then 2 mins

const storeState = {
	currentStepKey: 'step-1',
	steps: [step, step, step],
	state: 'task_id_1', // In generic case should be any object
	actions: {
		goNextStep: () => {},
		goPreviousStep: () => {},
		goToStep: (stepKey) => {}, // stepKey is valid step key
		reset: (newState) => {}, // Go back to step 1 and resetState
	},
}

const inputTask: Partial<Task> = {
	id: 'sdajfhasf_dfsdf',
	title: 'Do thing',
	status: 'inbox',
}

const resultTask: Task = {
	id: 'sdajfhasf_dfsdf',
	title: 'Do thing',
	status: 'next_action',
	// New data
	area: 'personal',
	context: 'admin',
	estimatedMinutes: 15,
}

const inputTask2: Partial<Task> = {
	id: 'sdajfhasf_dfsdf',
	title: 'Message from the slack',
	notes: 'Original message: ...',
	area: 'work',
	status: 'inbox',
}

const resultTask2: Task = {
	id: 'sdajfhasf_dfsdf',
	title: 'Message from the slack',
	notes: 'Original message: ...',
	area: 'work',

	// New data
	status: 'next_action',
	context: 'deep_work',
	projectId: 'test',
	estimatedMinutes: 30,
}

const inputProject: Partial<Task> = {
	id: 'sdajfhasf_dfsdf',
	title: 'Do something',
}

const resultProject: Task = {
	id: 'sdajfhasf_dfsdf',
	title: 'Do something',

	// Next info
	isProject: true,
	area: 'work',
	status: 'next_action',
}
