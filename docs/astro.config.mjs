// @ts-check
import starlight from '@astrojs/starlight'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'

// import dotenv from 'dotenv'

// import vue from '@astrojs/vue'

// dotenv.config()

// https://astro.build/config
export default defineConfig({
  vite: {},
  site: 'https://kitql.dev',
  integrations: [
    starlight({
      title: 'KitQL',
      logo: {
        light: './src/assets/logo.svg',
        dark: './src/assets/logo.svg',
        // replacesTitle: true,
      },
      social: {
        blueSky: 'https://bsky.app/profile/jyc.dev',
        github: 'https://github.com/jycouet/kitql',
      },
      editLink: {
        baseUrl: 'https://github.com/jycouet/kitql/edit/main/',
      },
      components: {
        Head: './src/components/Head.astro',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            {
              label: 'Introduction',
              link: '/docs',
            },
            {
              label: 'FAQ',
              link: '/docs/faq',
            },
          ],
        },
        {
          label: 'Tools',
          items: [
            {
              label: 'Helpers',
              link: '/docs/tools/04_helpers',
            },
            {
              label: 'SvelteKit',
              link: '/docs/tools/10_sveltekit',
            },
            {
              label: 'Handles',
              link: '/docs/tools/05_handles',
            },
            {
              label: 'vite-plugin-kit-routes',
              link: '/docs/tools/06_vite-plugin-kit-routes',
            },
            {
              label: 'vite-plugin-watch-and-run',
              link: '/docs/tools/03_vite-plugin-watch-and-run',
            },
            {
              label: 'vite-plugin-stripper',
              link: '/docs/tools/07_vite-plugin-stripper',
            },
            {
              label: 'eslint-config & prettier',
              link: '/docs/tools/08_eslint-config',
            },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
    icon(),
    // sentry({
    //   dsn: process.env.SENTRY_DSN,
    //   environment: process.env.SENTRY_ENVIRONMENT,
    //   sourceMapsUploadOptions: {
    //     project: process.env.SENTRY_PROJECT,
    //     authToken: process.env.SENTRY_AUTH_TOKEN,
    //   },
    // }),
    // vue(),
  ],
})
