import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: { noExternal: ['safe-stable-stringify'] },
	resolve: {
		preserveSymlinks: true
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
