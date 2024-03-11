import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

import { stripper } from './src/lib/plugin.js'

export default defineConfig({
  plugins: [
    stripper({
      // decorators: ['BackendMethod'],
      debug: true,
      log_on_throw_is_not_a_new_class: true,
      hard: true,
      packages: ['$env/static/private', 'oslo/password'],
    }),
    //
    sveltekit(),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
