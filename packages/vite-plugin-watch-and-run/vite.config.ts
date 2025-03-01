import path from 'node:path'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

import { watchAndRun } from './src/lib/index.js'

export default defineConfig({
  plugins: [
    sveltekit(),
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
