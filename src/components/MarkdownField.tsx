import { Textarea } from '@mantine/core'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { useTheme } from '@/theme'

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
	const { colorScheme } = useTheme()
	const isDark = colorScheme === 'dark'
	const [editMode, setEditMode] = useState(false)
	const checkboxIndexRef = useRef(0)

	const resolvedPlaceholder = placeholder ?? t('focusModalNotesPlaceholder')

	function handleBlur(val: string) {
		onChange(val)
		setEditMode(false)
	}

	function toggleCheckbox(index: number) {
		let count = 0
		const updated = value.replace(
			/^(\s*[-*+]\s+)\[([ x])\]/gm,
			(match, prefix, state) => {
				const result =
					count === index ? `${prefix}[${state === ' ' ? 'x' : ' '}]` : match
				count++
				return result
			},
		)
		onChange(updated)
	}

	if (editMode) {
		return (
			<Textarea
				autoFocus
				defaultValue={value}
				onBlur={(e) => handleBlur(e.currentTarget.value)}
				placeholder={resolvedPlaceholder}
				autosize
				minRows={5}
				styles={{
					input: {
						fontSize: 14,
						background: 'transparent',
						// Mantine Textarea internals cannot be styled via Tailwind
						border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
						fontFamily: 'monospace',
					},
				}}
			/>
		)
	}

	checkboxIndexRef.current = 0

	return (
		<div
			onDoubleClick={readOnly ? undefined : () => setEditMode(true)}
			className="cursor-text rounded-lg px-1 py-1.5 text-sm leading-relaxed"
			// minHeight is a dynamic prop value — cannot be expressed as a static Tailwind class
			style={{ minHeight, color: value ? 'var(--mantine-color-text)' : 'var(--mantine-color-dimmed)' }}
		>
			{value ? (
				<div className="markdown-preview">
					<ReactMarkdown
						remarkPlugins={[remarkGfm]}
						components={{
							input({ checked }) {
								const index = checkboxIndexRef.current++
								return (
									<input
										type="checkbox"
										checked={checked ?? false}
										onChange={() => toggleCheckbox(index)}
										className="cursor-pointer"
									/>
								)
							},
							h1: ({ children }) => (
								<h1 className="text-xl font-semibold mt-3 mb-1 text-(--mantine-color-text)">
									{children}
								</h1>
							),
							h2: ({ children }) => (
								<h2 className="text-lg font-semibold mt-3 mb-1 text-(--mantine-color-text)">
									{children}
								</h2>
							),
							h3: ({ children }) => (
								<h3 className="text-base font-semibold mt-2 mb-1 text-(--mantine-color-text)">
									{children}
								</h3>
							),
							a: ({ href, children }) => (
								<a
									href={href}
									target="_blank"
									rel="noreferrer"
									className="underline text-(--mantine-color-blue-5)"
								>
									{children}
								</a>
							),
							strong: ({ children }) => (
								<strong className="text-(--mantine-color-text)">{children}</strong>
							),
						}}
					>
						{value}
					</ReactMarkdown>
				</div>
			) : (
				<span className="italic opacity-50">{resolvedPlaceholder}</span>
			)}
		</div>
	)
}
