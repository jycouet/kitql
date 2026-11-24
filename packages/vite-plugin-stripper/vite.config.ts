import adapter from '@sveltejs/adapter-auto'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

import { stripper } from './src/lib/plugin.js'

const toRemove = ['oslo/password', 'oslo']

export default defineConfig(() => ({
	build: {
		// THE ERROR:
		// RollupError: Unexpected character '�' or Unexpected character '\u{7f}'
		// This code (A) is to fix in `build` mode
		rollupOptions: {
			external: toRemove,
		},
	},
	// This code (B) is to fix in `dev` mode
	optimizeDeps: {
		exclude: toRemove,
	},
	plugins: [
		stripper({
			debug: true,
			// decorators: ['BackendMethod'],
			// hard: true,
			nullify: ['oslo/password'],
			strip: [
				{ decorator: 'BackendMethod' },
				{
					decorator: 'Entity',
					args_1: [
						{ fn: 'backendPrefilter' },
						{ fn: 'backendPreprocessFilter' },
						{ fn: 'sqlExpression' },
					],
				},
			],
		}),
		sveltekit({ adapter: adapter(), preprocess: vitePreprocess() }),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		coverage: {
			reporter: ['html'],
		},
	},
}))
