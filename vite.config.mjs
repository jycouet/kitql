import { defineConfig } from 'vitest/node';

export default defineConfig({
	test: {
		coverage: {
			reporter: ['json-summary', 'html'],
			exclude: ['**/node_modules/**', '**/vite.config.mjs', '**/dist/**', '**/test/**']
		},
		reporters: 'default'
	}
});
