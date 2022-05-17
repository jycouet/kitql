module.exports = {
	root: true,
	extends: '@theguild',
	rules: {
		'unicorn/no-array-push-push': 'off'
	},
	ignorePatterns: ['examples', 'website'],
	plugins: ['svelte3'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
};
