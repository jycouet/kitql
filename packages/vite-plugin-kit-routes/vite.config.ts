import type { KIT_ROUTES } from '$lib/ROUTES.js'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

import { kitRoutes } from './src/lib/index.js'

export default defineConfig({
  plugins: [
    sveltekit(),
    // demo
    kitRoutes<KIT_ROUTES>({
      object_keys_format: '_',
      // default_type: 'string',
      // extra_search_params: 'with',
      // generated_file_path: 'src/lib/another_path_for_the_file.ts',
      post_update_run: 'npm exec prettier ./src/lib/ROUTES.ts -- -w',

      PAGES: {
        subGroup2: {
          explicit_search_params: {
            first: {
              required: true,
            },
          },
        },
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
      LINKS: {
        // reference to a hardcoded link
        twitter: 'https://twitter.com/jycouet',

        // reference to link with params!
        mailto: 'mailto:[email]',

        // reference to link with params & search params!
        twitter_post: {
          href: 'https://twitter.com/[name]/status/[id]',
          explicit_search_params: { limit: { type: 'number' } },
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
