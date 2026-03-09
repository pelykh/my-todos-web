import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'

export type ColorSchemeMode = 'light' | 'dark' | 'system'
type ColorScheme = 'light' | 'dark'

interface ThemeContextValue {
	colorScheme: ColorScheme
	colorSchemeMode: ColorSchemeMode
	setColorSchemeMode: (mode: ColorSchemeMode) => void
	toggleColorScheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemScheme(): ColorScheme {
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialMode(): ColorSchemeMode {
	try {
		const stored = localStorage.getItem('color-scheme')
		if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
	} catch {}
	return 'system'
}

function resolveScheme(mode: ColorSchemeMode): ColorScheme {
	if (mode === 'system') return getSystemScheme()
	return mode
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [mode, setMode] = useState<ColorSchemeMode>(getInitialMode)
	const [colorScheme, setColorScheme] = useState<ColorScheme>(() => resolveScheme(getInitialMode()))

	useEffect(() => {
		if (mode !== 'system') return
		const mq = window.matchMedia('(prefers-color-scheme: dark)')
		const handler = () => setColorScheme(mq.matches ? 'dark' : 'light')
		mq.addEventListener('change', handler)
		return () => mq.removeEventListener('change', handler)
	}, [mode])

	const setColorSchemeMode = useCallback((newMode: ColorSchemeMode) => {
		setMode(newMode)
		setColorScheme(resolveScheme(newMode))
		try {
			localStorage.setItem('color-scheme', newMode)
		} catch {}
	}, [])

	const toggleColorScheme = useCallback(() => {
		setColorSchemeMode(colorScheme === 'light' ? 'dark' : 'light')
	}, [colorScheme, setColorSchemeMode])

	return (
		<ThemeContext.Provider value={{ colorScheme, colorSchemeMode: mode, setColorSchemeMode, toggleColorScheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
	return ctx
}
