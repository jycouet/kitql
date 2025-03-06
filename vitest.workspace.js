import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  './packages/sveltekit/vite.config.ts',
  './packages/vite-plugin-watch-and-run/vite.config.ts',
  './packages/helpers/vite.config.ts',
  './packages/handles/vite.config.js',
  './packages/vite-plugin-kit-routes/vite.config.ts',
  './packages/vite-plugin-stripper/vite.config.ts',
  './packages/internals/vite.config.ts',
])
