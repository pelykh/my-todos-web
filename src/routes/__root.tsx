import '../styles.css'

import { MantineProvider } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'

import { useSyncEffect } from '@/hooks/useSyncEffect'
import { ThemeProvider, useTheme } from '@/theme'

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
	const { colorScheme } = useTheme()
	const isMobile = useMediaQuery('(max-width: 768px)')
	useSyncEffect()

	return (
		<MantineProvider forceColorScheme={colorScheme}>
			<Outlet />
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
	)
}
