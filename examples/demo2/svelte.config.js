import watchAndRun from '@kitql/vite-plugin-watch-and-run';
import adapter from '@sveltejs/adapter-auto';
import path from 'path';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),

		vite: {
			resolve: {
				alias: {
					$lib: path.resolve('./src/lib'),
					// $layout: path.resolve('./src/lib/components/layout'),
					// $ui: path.resolve('./src/lib/components/ui'),
					$graphql: path.resolve('./src/lib/graphql'),
					$modules: path.resolve('./src/lib/modules')
					// $utils: path.resolve('./src/lib/utils'),
					// $stores: path.resolve('./src/lib/utils/stores.ts'),
					// $theme: path.resolve('./src/lib/utils/theme.ts')
				}
			},
			plugins: [
				watchAndRun([
					{
						watch: '**/*.(gql|graphql)',
						run: 'npm run gen'
					}
				])
			]
		}
	}
};

export default config;
