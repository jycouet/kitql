import prettierConfig from '@theguild/prettier-config'

const config = {
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
		'^(firstly/)(.*)$', // special
		'^(@kitql)(.*)$', // special
		'',
		'^(\\$env)(.*)$', // special sveltekit
		'^(\\$app)(.*)$', // special sveltekit
		'',
		'^(\\$server)(.*)$', // special firstly
		'^(\\$modules)(.*)$', // special firstly
		'^(\\$)(.*)$', // Aliases
		'',
		'^[./]', // inside
	],
	overrides: [
		{
			files: ['README.md', 'packages/**/README.md'],
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
	],
}
export default config

export const kitql = () => {
	return config
}
