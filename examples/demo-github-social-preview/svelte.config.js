import watchAndRun from '@kitql/vite-plugin-watch-and-run';
import adapter from '@sveltejs/adapter-auto';
import houdini from 'houdini/preprocess';
import path from 'path';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [preprocess(), houdini()],

	kit: {
		adapter: adapter(),
		vite: {
			resolve: {
				alias: {
					$houdini: path.resolve('.', '$houdini'),
					$graphql: path.resolve('src', 'lib', 'graphql')
				}
			},
			server: {
				fs: {
					allow: ['.']
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
