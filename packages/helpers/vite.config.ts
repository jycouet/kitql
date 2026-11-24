import adapter from '@sveltejs/adapter-auto'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			alias: { $lib: 'src/lib' },
			preprocess: vitePreprocess(),
		}),
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
