import { Button, type ButtonProps } from '@mantine/core'
import { useEffect } from 'react'

type ShortcutButtonProps = ButtonProps & {
	shortcut: string
}

export function ShortcutButton({
	shortcut,
	onClick,
	disabled,
	children,
	...rest
}: ShortcutButtonProps) {
	useEffect(() => {
		function handler(e: KeyboardEvent) {
			const tag = (e.target as HTMLElement).tagName
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
			if (disabled) return
			if (e.key === shortcut) {
				onClick?.(e as never)
			}
		}
		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [shortcut, onClick, disabled])

	return (
		<Button
			onClick={onClick}
			disabled={disabled}
			rightSection={
				<kbd style={{ fontSize: '0.7em', opacity: 0.6, fontFamily: 'monospace' }}>
					{shortcut}
				</kbd>
			}
			{...rest}
		>
			{children}
		</Button>
	)
}
