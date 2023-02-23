import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: adapter(),

    alias: {
      $graphql: './src/lib/graphql',
    },
  },

  // package: {
  //   dir: 'dist',
  //   exports: file => {
  //     const list_ok = ['index.ts', 'cjs.cjs', 'offline.ts']
  //     return list_ok.includes(file)
  //   },
  // },
}

export default config
