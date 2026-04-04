import '../styles.css'

import { MantineProvider } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { createContext, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Toaster } from 'sonner'

import { CommandPalette } from '@/components/CommandPalette'
import { MiniTimer } from '@/components/MiniTimer'
import { useSyncEffect } from '@/hooks/useSyncEffect'
import { ThemeProvider, useTheme } from '@/theme'

export const CmdContext = createContext({ openCmd: () => {} })

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	return (
		<ThemeProvider>
			<ThemedApp />
		</ThemeProvider>
	)
}

function ThemedApp() {
	const { colorScheme, toggleColorScheme } = useTheme()
	const isMobile = useMediaQuery('(max-width: 768px)')
	useSyncEffect()

	const [cmdOpen, setCmdOpen] = useState(false)
	const [cmdSeed, setCmdSeed] = useState('')
	const cmdInputRef = useRef<HTMLInputElement>(null)
	const navigate = useNavigate()

	function openCmd() {
		setCmdOpen(true)
		cmdInputRef.current?.focus()
	}

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (cmdOpen) return
			if (e.key.length !== 1) return
			if (e.ctrlKey || e.metaKey || e.altKey) return
			const active = document.activeElement
			if (
				active instanceof HTMLInputElement ||
				active instanceof HTMLTextAreaElement ||
				(active as HTMLElement)?.isContentEditable
			) return
			setCmdSeed(e.key)
			setCmdOpen(true)
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [cmdOpen])

	useHotkeys('mod+k', () => { setCmdOpen((o) => { if (!o) cmdInputRef.current?.focus(); return !o }) }, { preventDefault: true, enableOnFormTags: true })
	useHotkeys('ctrl+t', () => navigate({ to: '/morning-flow' }), { preventDefault: true, enableOnFormTags: true })
	useHotkeys('ctrl+w', () => navigate({ to: '/weekly-review' }), { preventDefault: true, enableOnFormTags: true })
	useHotkeys('ctrl+i', () => navigate({ to: '/process-inbox' }), { preventDefault: true, enableOnFormTags: true })
	useHotkeys('shift+mod+l', () => toggleColorScheme(), { preventDefault: true, enableOnFormTags: true })

	return (
		<CmdContext.Provider value={{ openCmd }}>
		<MantineProvider forceColorScheme={colorScheme}>
			<Outlet />
			<CommandPalette ref={cmdInputRef} open={cmdOpen} initialSearch={cmdSeed} onClose={() => { setCmdOpen(false); setCmdSeed('') }} />
			<div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
				<MiniTimer />
			</div>
			<Toaster
				position={isMobile ? 'top-center' : 'bottom-right'}
				theme={colorScheme}
				style={{ '--z-index': '9999' } as React.CSSProperties}
				toastOptions={{
					style: {
						background: 'light-dark(#EEF8EE, #2A3B2C)',
						color: 'var(--mantine-color-green-light-color)',
						border: '1px solid transparent',
						borderRadius: 'var(--mantine-radius-sm)',
						fontFamily: 'var(--mantine-font-family)',
						fontSize: 'var(--mantine-font-size-sm)',
					},
					actionButtonStyle: {
						background: 'var(--mantine-color-green-filled)',
						color: 'var(--mantine-color-white)',
						borderRadius: 'var(--mantine-radius-sm)',
						fontFamily: 'var(--mantine-font-family)',
						fontSize: 'var(--mantine-font-size-xs)',
						fontWeight: '500',
						padding: '2px 10px',
					},
				}}
			/>
			<TanStackDevtools
				config={{
					position: 'bottom-right',
				}}
				plugins={[
					{
						name: 'TanStack Router',
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</MantineProvider>
		</CmdContext.Provider>
	)
}
