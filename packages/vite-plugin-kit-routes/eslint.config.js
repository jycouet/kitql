import kitql from '@kitql/eslint-config'

/** @type { import("eslint").Linter.Config } */
export default [
	...kitql,
	{
		name: 'custom rules',
		rules: {
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'no-unused-disable': 'off',
		},
	},
	{
		ignores: ['src/test/'],
	},
]
