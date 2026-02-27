import { Card, Stack, Text } from '@mantine/core'

import { MarkdownField } from '@/components/MarkdownField'

type Props = {
	task: { title: string; notes?: string }
}

export function TaskCard({ task }: Props) {
	return (
		<Card  radius="md" p="xl">
			<Stack gap="sm">
				<Text fw={500}  style={{ lineHeight: 1.4 }}>
					{task.title}
				</Text>
				{task.notes && (
					<MarkdownField value={task.notes} onChange={() => {}} readOnly minHeight={0} />
				)}
			</Stack>
		</Card>
	)
}
