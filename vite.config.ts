/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
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
