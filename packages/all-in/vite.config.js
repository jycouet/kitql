import { sveltekit } from '@sveltejs/kit/vite'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],

  optimizeDeps: {
    include: ['safe-stable-stringify'],
  },

  build: {
    rollupOptions: {
      external: [
        '@graphql-yoga/render-graphiql', // Users will decide to opt-in by adding this dep (or not)
      ],
    },
  },
}

export default config
