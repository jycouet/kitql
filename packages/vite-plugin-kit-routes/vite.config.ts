import path from 'path'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { kit_routes } from './src/lib/index.js'

export default defineConfig({
  plugins: [
    sveltekit(),
    // demo
    kit_routes(),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
