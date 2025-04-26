import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

import type { KIT_ROUTES } from '$lib/ROUTES.js'

import { kitRoutes } from '../../src/lib/index.js'

export default defineConfig({
	plugins: [
		sveltekit(),
		// demo
		kitRoutes<KIT_ROUTES>(),
	],
	test: {
		include: ['src/**/*.spec.ts'],
	},
})
