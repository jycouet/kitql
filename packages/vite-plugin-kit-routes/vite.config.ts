import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { kitRoutes } from './src/lib/index.js'

export default defineConfig({
  plugins: [
    sveltekit(),
    // demo
    kitRoutes({
      // for testing
      // generated_file_path: 'src/lib/ROUTES2.ts',
      post_update_run: 'npm exec prettier ./src/lib/ROUTES.ts -- -w',
      // allow_extra_search_params: true,
    }),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
