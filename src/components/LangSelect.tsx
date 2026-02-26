import { SegmentedControl } from '@mantine/core'
import { useTranslation } from 'react-i18next'

const LANGS = [
	{ value: 'en', label: 'EN' },
	{ value: 'uk', label: 'UK' },
]

export function LangSelect() {
	const { i18n, t } = useTranslation()
	const current = LANGS.some((l) => l.value === i18n.language)
		? i18n.language
		: 'en'

	return (
		<SegmentedControl
			size="xs"
			value={current}
			onChange={(val) => i18n.changeLanguage(val)}
			data={LANGS}
			aria-label={t('ariaLangSelect')}
		/>
	)
}
