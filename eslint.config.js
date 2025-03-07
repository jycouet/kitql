import { kitql } from './packages/eslint-config/eslint.config.js'

/** @type { import("eslint").Linter.Config } */
export default [
	...kitql({ pnpmCatalogs: true }),
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
