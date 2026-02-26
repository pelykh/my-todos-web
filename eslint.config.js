import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
	{
		ignores: [
			'src/routeTree.gen.ts',
			'src/styles.css',
			'dist/**',
			'node_modules/**',
			'.claude/**',
			'**/*.cjs',
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
		plugins: {
			react: reactPlugin,
			'react-hooks': reactHooks,
			'simple-import-sort': simpleImportSort,
		},
		languageOptions: {
			globals: { ...globals.browser, ...globals.es2022 },
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		settings: {
			react: { version: 'detect' },
		},
		rules: {
			...reactPlugin.configs.flat.recommended.rules,
			...reactPlugin.configs.flat['jsx-runtime'].rules,
			...reactHooks.configs.recommended.rules,
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'react/prop-types': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports', fixStyle: 'separate-type-imports' },
			],
			// Empty catch blocks are intentional (e.g. localStorage access)
			'no-empty': ['error', { allowEmptyCatch: true }],
			// Downgrade to warn — violations are intentional in this codebase
			'react-hooks/exhaustive-deps': 'warn',
			'react-hooks/set-state-in-effect': 'warn',
		},
	},
	prettierConfig,
)
