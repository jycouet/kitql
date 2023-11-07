import { sveltekit } from '@sveltejs/kit/vite'
import type { ROUTES } from '$lib/ROUTES.js'
import { defineConfig } from 'vite'
import { kitRoutes } from './src/lib/index.js'

type TT = 'A' | 'B'
const u: Partial<Record<TT, string>> = {}

export default defineConfig({
  plugins: [
    sveltekit(),
    // demo
    kitRoutes<ROUTES>({
      // for testing
      // generated_file_path: 'src/lib/ROUTES2.ts',
      post_update_run: 'npm exec prettier ./src/lib/ROUTES.ts -- -w',
      // extra_search_params: 'with',
      extend: {
        PAGES: {
          site: {
            // extra_search_params: 'with',
            explicit_search_params: { limit: { type: 'number' } },
            params: {
              // yop: { type: 'number' },
            },
          },

          site_id: {
            explicit_search_params: { limit: { type: 'number' } },
            params: { id: { type: 'string', default: '' } },
          },
        },
        SERVERS: {
          // site: {
          //   params: {
          //   }
          // }
          // yop: {},
        },
      },
    }),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
