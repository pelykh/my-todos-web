import { DateInput } from '@mantine/dates'
import { Flag } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface DueDatePickerProps {
	value: string | null
	onChange: (value: string | null) => void
}

export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
	const { t } = useTranslation()
	const [opened, setOpened] = useState(false)

	const dateValue = value ? new Date(value) : null

	function handleChange(date: string | null) {
		if (!date) {
			onChange(null)
			return
		}
		onChange(date)
	}

	if (!opened && !value) {
		return (
			<div className="p-2">
				<Flag
					size={14}
					className="cursor-pointer opacity-40 hover:opacity-70 transition-opacity"
					onClick={() => setOpened(true)}
				/>
			</div>
		)
	}

	return (
		<DateInput
			value={dateValue}
			onChange={handleChange}
			placeholder={t('dueDate')}
			leftSection={
				<Flag
					size={14}
					color={value ? 'var(--mantine-color-red-6)' : undefined}
				/>
			}
			valueFormat="MMM D, YYYY"
			clearable
			size="xs"
			minDate={(() => {
				const d = new Date()
				d.setHours(0, 0, 0, 0)
				return d
			})()}
			autoFocus={opened && !value}
			onBlur={() => {
				if (!value) setOpened(false)
			}}
			popoverProps={{
				onClose: () => {
					if (!value) setOpened(false)
				},
			}}
			styles={
				value ? { input: { color: 'var(--mantine-color-red-6)' } } : undefined
			}
		/>
	)
}
