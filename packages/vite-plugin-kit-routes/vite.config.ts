import { sveltekit } from '@sveltejs/kit/vite'
import type { ROUTES } from '$lib/ROUTES.js'
import { defineConfig } from 'vite'
import { kitRoutes } from './src/lib/index.js'

export default defineConfig({
  plugins: [
    sveltekit(),
    // demo
    kitRoutes<ROUTES>({
      // for testing
      // generated_file_path: 'src/lib/ROUTES2.ts',
      // post_update_run: 'npm exec prettier ./src/lib/ROUTES.ts -- -w',
      // extra_search_params: 'with',
      extend: {
        PAGES: {
          lang_site: {
            // extra_search_params: 'with',
            explicit_search_params: { limit: { type: 'number' } },
            params: {
              // yop: { type: 'number' },
            },
          },
          lang_site_id: {
            explicit_search_params: { limit: { type: 'number' } },
            params: {
              id: { type: 'string', default: '7' },
              lang: { type: 'string', default: 'fr' },
            },
          },
          lang_site_contract_siteId_contractId: {
            explicit_search_params: { limit: { type: 'number' } },
          },
        },
        SERVERS: {
          // site: {
          //   params: { }
          // }
          // yop: {},
        },
        ACTIONS: {
          lang_site_contract_siteId_contractId: {
            explicit_search_params: {
              extra: { type: "'A' | 'B'", default: 'A' },
            },
          },
        },
      },
      storage: {
        params: {
          lang: {
            type: "'en' | 'fr' | 'at'",
            default: 'fr',
          },
        },
      },
    }),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
