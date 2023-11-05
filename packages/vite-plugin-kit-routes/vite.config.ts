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
      // extra_search_params: 'with',
      extend: {
        PAGES: {
          site: {
            // extra_search_params: 'with',
            explicit_search_params: { limit: { type: 'number' } },
          },
          site_id: {
            // extra_search_params: 'with',
            explicit_search_params: { limit: { type: 'number' } },
          },
        },
        // SERVERS: {
        //   yop: {},
        // },
      },
    }),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
