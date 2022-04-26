// import watchAndRun from '@kitql/vite-plugin-watch-and-run';
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
			plugins: [
				// watchAndRun([
				// 	{
				// 		watch: '**/*.(gql|graphql)',
				// 		run: 'yarn gen'
				// 	}
				// ])
			],
			resolve: {
				alias: {
					'@kitql/client': path.resolve('./src/lib/toExport'),
					'@kitql/all-in': path.resolve('../all-in/src/lib'),
					'@kitql/helper': path.resolve('../helper/src')
				}
			}
		}
	}
};

export default config;
