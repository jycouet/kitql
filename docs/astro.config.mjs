// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import icon from 'astro-icon'

import sentry from '@sentry/astro'
import dotenv from 'dotenv'

import vue from '@astrojs/vue'

dotenv.config()

// https://astro.build/config
export default defineConfig({
  vite: {},
  integrations: [
    starlight({
      title: 'Accessible Astro Documentation',
      logo: {
        light: './src/assets/logo.svg',
        dark: './src/assets/logo.svg',
        replacesTitle: true,
      },
      social: {
        blueSky: 'https://bsky.app/profile/jyc.dev',
        github: 'https://github.com/jycouet',
      },
      editLink: {
        baseUrl: 'https://github.com/jycouet/kitql/edit/main/',
      },
      components: {
        Head: './src/components/Head.astro',
      },
      sidebar: [
        {
          label: 'Getting started',
          items: [
            {
              label: 'Introduction',
              link: '/docs',
            },
            {
              label: 'Why accessibility matters',
              link: '/getting-started/accessibility',
            },
            {
              label: 'Accessibility testing',
              link: '/getting-started/accessibility-testing',
              badge: {
                text: 'tip',
                variant: 'note',
              },
            },
            {
              label: 'Quick start guide',
              link: '/getting-started/quick-start',
            },
            {
              label: 'Installation options',
              link: '/getting-started/installation',
            },
          ],
        },
        {
          label: 'Themes',
          items: [
            {
              label: 'Accessible Astro Starter',
              link: '/themes/accessible-astro-starter',
            },
            {
              label: 'Accessible Astro Dashboard',
              link: '/themes/accessible-astro-dashboard',
            },
          ],
        },
        {
          label: 'Components',
          items: [
            {
              label: 'Overview',
              link: '/components/overview',
            },
            {
              label: 'Accordion',
              link: '/components/accordion',
            },
            {
              label: 'Avatar',
              link: '/components/avatar',
              badge: {
                text: 'next',
                variant: 'tip',
              },
            },
            {
              label: 'Badge',
              link: '/components/badge',
              badge: {
                text: 'next',
                variant: 'tip',
              },
            },
            {
              label: 'Breadcrumbs',
              link: '/components/breadcrumbs',
            },
            {
              label: 'Card',
              link: '/components/card',
            },
            {
              label: 'DarkMode',
              link: '/components/dark-mode',
            },
            {
              label: 'Drawer',
              link: '/components/drawer',
              badge: {
                text: 'soon',
                variant: 'caution',
              },
            },
            {
              label: 'Forms',
              link: '/components/forms',
              badge: {
                text: 'soon',
                variant: 'caution',
              },
            },
            {
              label: 'Media',
              link: '/components/media',
            },
            {
              label: 'Modal',
              link: '/components/modal',
            },
            {
              label: 'Notification',
              link: '/components/notification',
            },
            {
              label: 'Pagination',
              link: '/components/pagination',
            },
            {
              label: 'SkipLink',
              link: '/components/skip-link',
            },
            {
              label: 'Tabs',
              link: '/components/tabs',
            },
            {
              label: 'Tooltip',
              link: '/components/tooltip',
              badge: {
                text: 'soon',
                variant: 'caution',
              },
            },
            {
              label: 'Video',
              link: '/components/video',
              badge: {
                text: 'new!',
                variant: 'success',
              },
            },
          ],
        },
        {
          label: 'Contributing',
          items: [
            {
              label: 'How to contribute',
              link: '/contributing/how-to',
            },
            {
              label: 'Development setup',
              link: '/contributing/development',
            },
            {
              label: 'Code style guide',
              link: '/contributing/style-guide',
            },
            {
              label: 'Reporting issues',
              link: '/contributing/issues',
            },
            {
              label: '❤️ Supporting the project',
              link: '/contributing/support-us',
            },
          ],
        },
        {
          label: 'Resources',
          items: [
            {
              label: 'Site showcases',
              link: '/resources/showcases',
            },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
    icon(),
    sentry({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT,
      sourceMapsUploadOptions: {
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
    vue(),
  ],
})
