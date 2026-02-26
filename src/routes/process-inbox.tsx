import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Container,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DelegateStep } from '@/components/inbox-steps/DelegateStep'
import { DescribeTaskStep } from '@/components/inbox-steps/DescribeTaskStep'
import { DoItNowStep } from '@/components/inbox-steps/DoItNowStep'
import { ExistingProjectStep } from '@/components/inbox-steps/ExistingProjectStep'
import { IsActionableStep } from '@/components/inbox-steps/IsActionableStep'
import { IsDelegateStep } from '@/components/inbox-steps/IsDelegateStep'
import { IsLessThan2MinutesStep } from '@/components/inbox-steps/IsLessThan2MinutesStep'
import { IsProjectStep } from '@/components/inbox-steps/IsProjectStep'
import { NewProjectStep } from '@/components/inbox-steps/NewProjectStep'
import { NotActionStep } from '@/components/inbox-steps/NotActionStep'
import { ReferenceStep } from '@/components/inbox-steps/ReferenceStep'
import { SelectProjectStep } from '@/components/inbox-steps/SelectProjectStep'
import { resetInboxStepper, useInboxCurrentStep } from '@/store/inboxStepper'
import { useFilteredTasks } from '@/store/taskStore'

export const Route = createFileRoute('/process-inbox')({
	component: ProcessInbox,
})

function ProcessInbox() {
	const { t } = useTranslation()
	const inboxTasks = useFilteredTasks({ status: 'inbox' })
	const projects = useFilteredTasks({ isProject: true })

	const [processedCount, setProcessedCount] = useState(0)
	const [total] = useState(() => inboxTasks.length)

	const currentStep = useInboxCurrentStep()

	const task = inboxTasks[0]
	const done = task === undefined

	function advance() {
		setProcessedCount((c) => c + 1)
		resetInboxStepper()
	}

	if (done || total === 0) {
		return (
			<Container size="sm" py="xl">
				<Stack align="center" gap="lg" mt="xl">
					<CheckCircle2 size={48} color="var(--mantine-color-green-6)" />
					<Title order={2} ta="center">
						{t('processInboxEmpty')}
					</Title>
					<Button component={Link} to="/" variant="light">
						{t('processInboxBack')}
					</Button>
				</Stack>
			</Container>
		)
	}

	return (
		<>
			<Group style={{ position: 'fixed', top: 16, left: 16, zIndex: 200 }}>
				<ActionIcon
					component={Link}
					to="/"
					variant="default"
					size="lg"
					radius="md"
					aria-label={t('processInboxBack')}
				>
					<ArrowLeft size={18} />
				</ActionIcon>
			</Group>

			<Container size="sm" py="xl">
				<Stack gap="xl" mt={60}>
					<Group justify="space-between" align="center">
						<Title order={3}>{t('processInboxTitle')}</Title>
						<Badge variant="light" color="gray" size="lg">
							{t('processInboxProgress', {
								current: processedCount + 1,
								total,
							})}
						</Badge>
					</Group>

					<Card withBorder radius="md" p="xl">
						<Stack gap="sm">
							<Text fw={600} size="lg" style={{ lineHeight: 1.4 }}>
								{task.title}
							</Text>
							{task.notes && (
								<Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
									{task.notes}
								</Text>
							)}
						</Stack>
					</Card>

					{currentStep === '1_0_is_actionable' && <IsActionableStep />}
					{currentStep === '1_1_not_action' && (
						<NotActionStep task={task} onAdvance={advance} />
					)}
					{currentStep === '1_1_1_reference' && (
						<ReferenceStep task={task} onAdvance={advance} />
					)}
					{currentStep === '2_0_is_less_then_2_minutes' && (
						<IsLessThan2MinutesStep />
					)}
					{currentStep === '2_1_less_then_2_minutes' && (
						<DoItNowStep task={task} onAdvance={advance} />
					)}
					{currentStep === '3_0_is_delegate' && <IsDelegateStep />}
					{currentStep === '3_1_delegate' && (
						<DelegateStep task={task} onAdvance={advance} />
					)}
					{currentStep === '4_0_is_project' && <IsProjectStep />}
					{currentStep === '4_1_project' && (
						<SelectProjectStep projects={projects} />
					)}
					{currentStep === '4_1_1_new_project' && (
						<NewProjectStep task={task} onAdvance={advance} />
					)}
					{currentStep === '4_1_2_existing_project' && (
						<ExistingProjectStep
							task={task}
							projects={projects}
							onAdvance={advance}
						/>
					)}
					{currentStep === '5_0_describe_task' && (
						<DescribeTaskStep task={task} onAdvance={advance} />
					)}
				</Stack>
			</Container>
		</>
	)
}
