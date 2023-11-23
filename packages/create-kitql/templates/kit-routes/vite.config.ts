import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { kitRoutes } from 'vite-plugin-kit-routes';

export default defineConfig({
	plugins: [
		sveltekit(),
		kitRoutes({
			LINKS: {
				twitter: 'https://twitter.com/jycouet',
				github: 'https://github.com/jycouet/kitql',
				github_avatar: { href: 'https://avatars.githubusercontent.com/[author]' },
				gravatar: {
					href: 'https://www.gravatar.com/avatar/[str]',
					explicit_search_params: {
						s: { type: 'number', default: 75 },
						d: { type: '"retro" | "identicon"', default: '"identicon"' }
					}
				}
			}
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
