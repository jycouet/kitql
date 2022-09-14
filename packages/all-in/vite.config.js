import { sveltekit } from '@sveltejs/kit/vite'
// import watchAndRun from 'vite-plugin-watch-and-run'
// import { resolve } from 'path'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    // watchAndRun([
    //   {
    //     watch: '**/*.graphql',
    //     run: 'npm run gen',
    //   },
    // ]),
  ],
  // resolve: {
  //   alias: {
  //     '@kitql/helper': resolve('../packages/helper/src/index'),
  //     'vite-plugin-watch-and-run': resolve('../packages/vite-plugin-watch-and-run/src/index'),
  //   },
  // },
}

export default config
