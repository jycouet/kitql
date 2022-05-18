module.exports = {
	root: true,
	extends: '@theguild',
	rules: {
		'unicorn/no-array-push-push': 'off',
		'unicorn/filename-case': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'no-console': ['error', { allow: ['info', 'warn', 'error', 'time', 'timeEnd'] }],
		'no-restricted-syntax': 'off',
		'import/no-default-export': 'off',
		'@typescript-eslint/ban-types': 'off'
	},
	ignorePatterns: ['examples', 'website'],
	plugins: ['svelte3'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	}
};
