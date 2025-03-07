import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
	// disable automatic CORS in dev and preview, which is enabled by default and breaks our testing
	// of explicit cors handling
	server: {
		cors: {
			origin: false,
		},
	},
	preview: {
		cors: {
			origin: false,
		},
	},
})
