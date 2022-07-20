import watchAndRun from '@kitql/vite-plugin-watch-and-run';
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
		watchAndRun([
			{
				watch: '**/*.(gql|graphql)',
				run: 'npm run gen'
			}
		])
	],
	server: {
		fs: {
			allow: ['.']
		}
	}
};

export default config;
