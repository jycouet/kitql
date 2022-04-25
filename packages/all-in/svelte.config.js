import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),

		package: {
			dir: 'dist',
			exports: () => {
				return true;
			}
		},

		vite: {
			resolve: {
				alias: {
					'@kitql/client': path.resolve('./src/lib/toExport')
				}
			}
		}
	}
};

export default config;
