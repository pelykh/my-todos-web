import { useTranslation } from 'react-i18next'

import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'

interface MarkdownFieldProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	minHeight?: number
	readOnly?: boolean
}

export function MarkdownField({
	value,
	onChange,
	placeholder,
	minHeight = 48,
	readOnly = false,
}: MarkdownFieldProps) {
	const { t } = useTranslation()

	return (
		<div style={{ minHeight }}>
			<SimpleEditor
				value={value}
				onChange={onChange}
				placeholder={placeholder ?? t('focusModalNotesPlaceholder')}
				editable={!readOnly}
			/>
		</div>
	)
}
