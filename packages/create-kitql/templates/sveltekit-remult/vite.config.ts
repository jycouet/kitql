import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { kitRoutes } from 'vite-plugin-kit-routes';
import { striper } from 'vite-plugin-striper';

export default defineConfig({
	plugins: [
		sveltekit(),
		striper({ decorators: ['BackendMethod'] }),
		kitRoutes({
			post_update_run: 'npm exec prettier ./src/lib/ROUTES.ts -- -w',
			LINKS: {
				twitter_jycouet: 'https://twitter.com/jycouet',
				github_kitql: 'https://github.com/jycouet/kitql',
				github_remult: 'https://github.com/jycouet/kitql'
			}
		})
	],
	test: {
		include: ['src/**/*.spec.{js,ts}']
	}
});
