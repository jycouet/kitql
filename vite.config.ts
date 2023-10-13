/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', 'examples'],
    coverage: {
      reporter: ['json-summary', 'html'],
      exclude: ['**/node_modules/**', '**/vite.config.mjs', '**/dist/**', '**/test/**'],
    },
    reporters: 'default',
  },
  resolve: {
    alias: {
      '@kitql/helper': resolve('./packages/helper/src/index'),
    },
  },
})
