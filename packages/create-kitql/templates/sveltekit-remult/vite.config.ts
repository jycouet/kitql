import { sveltekit } from '@sveltejs/kit/vite'
import { kitRoutes } from 'vite-plugin-kit-routes'
import { stripper } from 'vite-plugin-stripper'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    sveltekit(),
    stripper({ decorators: ['BackendMethod'] }),
    kitRoutes({
      logs: {
        post_update_run: false,
        update: false,
      },
      post_update_run: 'npm run lint -- -f -g src/lib/ROUTES.ts',
      LINKS: {
        twitter_jycouet: 'https://twitter.com/jycouet',
        github_kitql: 'https://github.com/jycouet/kitql',
        github_remult: 'https://github.com/jycouet/kitql',
      },
    }),
  ],
  test: {
    include: ['src/**/*.spec.{js,ts}'],
  },
})
