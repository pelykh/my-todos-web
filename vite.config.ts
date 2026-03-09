import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
	plugins: [
		devtools(),
		tsconfigPaths({ projects: ['./tsconfig.json'] }),
		tailwindcss(),
		tanstackRouter({ target: 'react', autoCodeSplitting: true }),
		viteReact(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['icons/*.png'],
			manifest: {
				name: 'My Todos',
				short_name: 'Todos',
				description: 'GTD-style task manager',
				theme_color: '#f97316',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait',
				scope: '/',
				start_url: '/',
				icons: [
					{ src: 'icons/icon-72.png',   sizes: '72x72',   type: 'image/png' },
					{ src: 'icons/icon-96.png',   sizes: '96x96',   type: 'image/png' },
					{ src: 'icons/icon-128.png',  sizes: '128x128', type: 'image/png' },
					{ src: 'icons/icon-144.png',  sizes: '144x144', type: 'image/png' },
					{ src: 'icons/icon-152.png',  sizes: '152x152', type: 'image/png' },
					{ src: 'icons/icon-192.png',  sizes: '192x192', type: 'image/png', purpose: 'any' },
					{ src: 'icons/icon-384.png',  sizes: '384x384', type: 'image/png' },
					{ src: 'icons/icon-512.png',  sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
				],
			},
		}),
	],
})

export default config
