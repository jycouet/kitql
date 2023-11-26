import type { KIT_ROUTES } from '$lib/ROUTES.js'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

import { kitRoutes } from './src/lib/index.js'

// export function route(key: 'subGroup2', params: { first: string | number }): string
// export function route(key: '_ROOT'): string
// export function route(key: any, ...params: any): string {

export default defineConfig({
  plugins: [
    sveltekit(),
    // demo
    kitRoutes<KIT_ROUTES>({
      format: '_',
      // format: "route('_')",
      logs: ['update', 'errors'],
      // path_base: true,
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
        site: {
          extra_search_params: 'with',
          explicit_search_params: { limit: { type: 'number' } },
          params: {
            // yop: { type: 'number' },
          },
        },
        site_id: {
          explicit_search_params: { limit: { type: 'number' }, demo: { type: 'string' } },
          params: {
            id: { type: 'string', default: '"Vienna"' },
            lang: { type: "'fr' | 'hu' | undefined", default: '"fr"' },
          },
        },
        site_contract_siteId_contractId: {
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
        default_contract_id: {
          explicit_search_params: {
            limit: { type: 'number' },
          },
        },
        send_site_contract_siteId_contractId: {
          explicit_search_params: {
            extra: { type: "'A' | 'B'", default: '"A"' },
          },
        },
        create_site: {
          explicit_search_params: {
            redirectTo: { type: '"list" | "new" | "detail"' },
          },
        },
      },
      LINKS: {
        // reference to a hardcoded link
        twitter: 'https://twitter.com/jycouet',

        // reference to link with params!
        twitter_post: 'https://twitter.com/[name]/status/[id]',

        // reference to link with params & search params!
        gravatar: {
          href: 'https://www.gravatar.com/avatar/[str]',
          params: {
            str: { type: 'string' },
          },
          explicit_search_params: {
            s: { type: 'number', default: 75 },
            d: { type: '"retro" | "identicon"', default: '"identicon"' },
          },
        },
      },

      override_params: {
        lang: { type: "'fr' | 'en' | 'hu' | 'at' | string" },
      },
    }),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
