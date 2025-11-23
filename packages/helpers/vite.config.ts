import { sveltekit } from '@sveltejs/kit/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [
		sveltekit(),
		visualizer({
			// template: 'raw-data', 'sunburst',
			emitFile: true,
			open: true,
			filename: 'stats.html',
			gzipSize: true,
		}),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
})
