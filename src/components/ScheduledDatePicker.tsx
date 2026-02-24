import { DateInput } from '@mantine/dates'
import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ScheduledDatePickerProps {
	value: string | null
	onChange: (value: string | null) => void
}

export function ScheduledDatePicker({
	value,
	onChange,
}: ScheduledDatePickerProps) {
	const { t } = useTranslation()
	const [opened, setOpened] = useState(false)

	const dateValue = value ? new Date(value) : null

	function handleChange(date: string | null) {
		console.log('handleChange', date)
		if (!date) {
			onChange(null)
			return
		}

		onChange(date)
	}

	if (!opened && !value) {
		return (
			<div className="p-2">
				<CalendarDays
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
			placeholder={t('scheduledDate')}
			leftSection={<CalendarDays size={14} />}
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
		/>
	)
}
