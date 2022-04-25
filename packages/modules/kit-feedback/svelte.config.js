import watchAndRun from '@kitql/vite-plugin-watch-and-run';
import adapter from '@sveltejs/adapter-auto';
import { dirname, resolve } from 'path';
import preprocess from 'svelte-preprocess';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [ preprocess({ postcss: true }) ],
	kit: {
		adapter: adapter(),
		vite: {
			plugins: [
				watchAndRun([ { watch: '**/*.(gql)', run: 'yarn gen' } ])
			],
			define: {
				PACKAGE_VERSION: JSON.stringify(process.env.npm_package_version),
				'process.env': process.env
			},
			resolve: {
				alias: {
					$lib: resolve(__dirname, './src/lib')
				}
			}
		},
		package: {
			dir: 'dist',
			emitTypes: true,
			exports: (filepath) => filepath.endsWith("index.js"),
			files: (filepath) => !filepath.endsWith(".test.ts"),
		},

	}
};

export default config;
