import path from 'path'
import adapter from '@sveltejs/adapter-auto'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

import { watchAndRun } from './src/lib/index.js'

export default defineConfig({
	plugins: [
		sveltekit({ adapter: adapter(), preprocess: vitePreprocess() }),
		// demo
		watchAndRun([
			{
				name: 'Yop  OK',
				run: 'echo coucou 👋',
				watch: path.resolve('src/**/*.svelte'),
			},
			{ name: 'Yop NOK', run: 'exit(1)', watch: path.resolve('src/**/*.svelte') },
		]),
		watchAndRun([
			{
				name: 'Readme update',
				run: 'echo Hello new readme 👋',
				watch: path.resolve('../../README.md'),
			},
		]),
	],
})
