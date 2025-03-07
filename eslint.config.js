import { kitql } from './packages/eslint-config/eslint.config.js'

/** @type { import("eslint").Linter.Config[] } */
export default [
	...kitql({
		// pnpmCatalogs: {
		// 	enable: true,
		// 	files: ['package.json', '**/*.package.json'],
		// 	rules: {
		// 		'pnpm-catalogs/enforce-catalog': 'error',
		// 		'pnpm-catalogs/valid-catalog': 'error',
		// 	},
		// },
	}),
	{
		name: 'APP:ignores',
		ignores: ['**/*.svelte.ts'],
	},
	{
		name: 'APP:rules',
		rules: {
			'@typescript-eslint/no-unsafe-function-type': 'off',
		},
	},
]
