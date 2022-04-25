module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['svelte3', '@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [
		{ files: ['*.svelte'], processor: 'svelte3/svelte3' },
		{
			files: ['*.graphql', '*.gql'],
			parserOptions: {
				operations: '**/*.gql',
				schema: '**/*.graphql'
			},
			extends: ['plugin:@graphql-eslint/schema-all', 'plugin:@graphql-eslint/operations-all'],
			rules: {
				'@graphql-eslint/naming-convention': 'off',
				'@graphql-eslint/alphabetize': 'off',
				'@graphql-eslint/match-document-filename': 'off'
			}
		}
	],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
