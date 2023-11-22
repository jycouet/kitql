import type { KIT_ROUTES } from '$lib/ROUTES.js'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

import { kitRoutes } from './src/lib/index.js'

export default defineConfig({
  plugins: [
    sveltekit(),
    // demo
    kitRoutes<KIT_ROUTES>({
      // for testing
      // generated_file_path: 'src/lib/ROUTES2.ts',
      post_update_run: 'npm exec prettier ./src/lib/ROUTES.ts -- -w',
      // extra_search_params: 'with',
      // keep_path_param_format: true,
      object_keys_format: '_',

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
            explicit_search_params: { limit: { type: 'number' }, demo: { type: 'string' } },
            params: {
              id: { type: 'string', default: '7' },
              lang: { type: "'fr' | 'hu' | undefined", default: 'fr' },
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

      override_params: {
        lang: { type: "'fr' | 'en' | 'hu' | 'at' | string" },
      },

      // TODO STORAGE?
      // storage: {
      //   params: {
      //     lang: {
      //       type: "'fr' | 'en' | 'hu' | 'at'",
      //       default: 'fr',
      //     },
      //   },
      // },
    }),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
