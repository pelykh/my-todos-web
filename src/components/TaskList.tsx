import { type TaskFilters } from '@/services'
import { useFilteredTasks } from '@/store/taskStore'

import { TaskListItem } from './TaskListItem'

type TaskListProps = {
	filters?: TaskFilters
}

export function TaskList({ filters }: TaskListProps) {
	const tasks = useFilteredTasks(filters)

	return (
		<div>
			{tasks.map((task) => (
				<TaskListItem key={task.id} taskId={task.id} />
			))}
		</div>
	)
}
