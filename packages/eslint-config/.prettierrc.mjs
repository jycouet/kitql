import prettierConfig from '@theguild/prettier-config'

export default {
	...prettierConfig,
	tabWidth: 1,
	useTabs: true,
	singleQuote: true,
	semi: false,
	arrowParens: 'always',
	plugins: [
		...prettierConfig.plugins,
		'prettier-plugin-svelte',
		'prettier-plugin-tailwindcss', // MUST come last
	],
	importOrderParserPlugins: ['typescript', 'decorators-legacy'],
	importOrder: [
		'<THIRD_PARTY_MODULES>',
		'',
		'^(\\$houdini)(.*)$', // special
		'^(remult)(.*)$', // special
		'^(firstly)(.*)$', // special
		'^(@kitql)(.*)$', // special
		'',
		'^(\\$env)(.*)$', // special sveltekit
		'^(\\$app)(.*)$', // special sveltekit
		'',
		'^(@app/common)(.*)$', // Aliases
		'^(\\$)(.*)$', // Aliases
		'',
		'^[./]', // inside
	],
}
