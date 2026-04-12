import { DateInput } from '@mantine/dates'
import { Clock } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface WaitingSincePickerProps {
	value: string | null
	onChange: (value: string | null) => void
}

export function WaitingSincePicker({ value, onChange }: WaitingSincePickerProps) {
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
				<Clock
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
			placeholder={t('waitingSinceLabel')}
			leftSection={
				<Clock
					size={14}
					color={value ? 'var(--mantine-color-yellow-6)' : undefined}
				/>
			}
			valueFormat="MMM D, YYYY"
			clearable
			size="xs"
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
				value ? { input: { color: 'var(--mantine-color-yellow-6)' } } : undefined
			}
		/>
	)
}
