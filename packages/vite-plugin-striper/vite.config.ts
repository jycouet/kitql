import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

import { striper } from './src/lib/plugin.js'

export default defineConfig({
  plugins: [
    striper({ log_warning_on_throw_is_not_a_class: true }),
    //
    sveltekit(),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
