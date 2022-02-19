import { defineConfig, configDefaults } from 'vitest/node';

export default defineConfig({
	test: {
		coverage: {
			reporter: ['json-summary', 'html']
		}
	}
});
