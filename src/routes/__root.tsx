import '../styles.css'

import { MantineProvider } from '@mantine/core'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

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
	useSyncEffect()

	return (
		<MantineProvider forceColorScheme={colorScheme}>
			<Outlet />
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
