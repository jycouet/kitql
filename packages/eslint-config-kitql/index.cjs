module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['unused-imports', 'svelte', '@typescript-eslint'],
	// Some preference rules by KitQL
	rules: {
		'no-console': ['error', { allow: ['info', 'warn', 'error', 'time', 'timeEnd'] }],
		'unused-imports/no-unused-imports': 'error',
		'@typescript-eslint/ban-ts-ignore': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off'
	},
	ignorePatterns: ['*.cjs', '*.sh'],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		},
		{
			files: ['*.graphql', '*.gql'],
			parserOptions: {
				operations: '**/*.gql',
				schema: '**/*.graphql'
			},
			// Enable all rules
			extends: ['plugin:@graphql-eslint/schema-all', 'plugin:@graphql-eslint/operations-all'],
			// Some preference rules by KitQL
			rules: {
				'@graphql-eslint/alphabetize': 'off',
				'@graphql-eslint/no-unreachable-types': 'off',
				'@graphql-eslint/description-style': 'off',
				'@graphql-eslint/executable-definitions': 'off',
				// '@graphql-eslint/match-document-filename': [
				// 	'error',
				// 	{
				// 		query: { style: 'PascalCase', suffix: '_QUERY' },
				// 		mutation: { style: 'PascalCase', suffix: '_MUTATION' },
				// 		subscription: { style: 'PascalCase', suffix: '_SUB' },
				// 		fragment: { style: 'PascalCase', suffix: '_FRAG' }
				// 	}
				// ],
				//				'@graphql-eslint/no-unused-fields': 'error', // i guess this gets overwritten by the duplicate config below
				//				'@graphql-eslint/require-id-when-available': 'error', // this too

				// All rules
				// https://github.com/B2o5T/graphql-eslint/blob/master/docs/README.md
				'@graphql-eslint/require-description': 'off',
				'@graphql-eslint/no-hashtag-description': 'off', // While migrating... after we can remove old stuff
				'@graphql-eslint/no-unused-fragments': 'off', // While migrating... after we can remove old stuff
				'@graphql-eslint/strict-id-in-types': 'off',
				'@graphql-eslint/no-typename-prefix': 'off', // Field "username" starts with the name of the parent type "User"
				'@graphql-eslint/naming-convention': 'off', // Operation "GetUsers" should not have "Get" prefix... Frag... Everything!
				'@graphql-eslint/input-name': 'off',
				'@graphql-eslint/no-scalar-result-type-on-mutation': 'off',
				'@graphql-eslint/require-field-of-type-query-in-mutation-result': 'off',
				'@graphql-eslint/match-document-filename': 'off', // Unexpected filename "QUERY.GetUsers.gql". Rename it to "get-users.gql" => Maybe we could do a custom rule?
				'@graphql-eslint/selection-set-depth': 'off',

				// Not in extends rules, but interesting
				'@graphql-eslint/no-unused-fields': 'off', // After migration? To make sure everything is used?
				'@graphql-eslint/no-root-type': 'off', // One day? moving everything under the module?
				'@graphql-eslint/unique-enum-value-names': 'error',

				// require-id-when-available https://github.com/B2o5T/graphql-eslint/issues/961 FRAG.peopleAccount
				'@graphql-eslint/require-id-when-available': 'off'
			}
		}
	],
	settings: {
		'svelte3/typescript': () => require('typescript'),
		'svelte3/ignore-warnings': (/** @type {{ code: string; }} */ warning) =>
			warning.code == 'a11y-click-events-have-key-events'
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
}
