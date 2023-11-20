import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

import { striper } from './src/lib/plugin.js'

export default defineConfig({
  plugins: [striper(), sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
