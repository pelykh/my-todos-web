import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from 'react'

type ColorScheme = 'light' | 'dark'

interface ThemeContextValue {
	colorScheme: ColorScheme
	toggleColorScheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialScheme(): ColorScheme {
	try {
		const stored = localStorage.getItem('color-scheme')
		if (stored === 'light' || stored === 'dark') return stored
	} catch {}
	return window.matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [colorScheme, setColorScheme] = useState<ColorScheme>(getInitialScheme)

	const toggleColorScheme = useCallback(() => {
		setColorScheme((prev) => {
			const next = prev === 'light' ? 'dark' : 'light'
			try {
				localStorage.setItem('color-scheme', next)
			} catch {}
			return next
		})
	}, [])

	return (
		<ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
	return ctx
}
