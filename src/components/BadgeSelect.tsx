import { Badge, type BadgeProps, Menu } from '@mantine/core'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface BadgeSelectOption {
	label: string
	value: string
}

interface BadgeSelectProps extends Omit<BadgeProps, 'children'> {
	options: BadgeSelectOption[]
	value: string | null
	onSelect: (value: string) => void
	placeholder?: string
}

export function BadgeSelect({
	options,
	value,
	onSelect,
	placeholder = 'Select…',
	...badgeProps
}: BadgeSelectProps) {
	const [opened, setOpened] = useState(false)

	const selected = options.find((o) => o.value === value)

	const items = options.map((option) => (
		<Menu.Item key={option.value} onClick={() => onSelect(option.value)}>
			{option.label}
		</Menu.Item>
	))

	return (
		<Menu
			opened={opened}
			onChange={setOpened}
			radius="md"
			withinPortal
			position="bottom-start"
		>
			<Menu.Target>
				<Badge variant="outline" className="cursor-pointer!" {...badgeProps}>
					{selected ? selected.label : placeholder}
				</Badge>
			</Menu.Target>
			<Menu.Dropdown>{items}</Menu.Dropdown>
		</Menu>
	)
}
