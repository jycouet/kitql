import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const config = {
	tabWidth: 1,
	useTabs: true,
	singleQuote: true,
	trailingComma: 'all',
	semi: false,
	arrowParens: 'always',
	printWidth: 100,
	plugins: [
		require.resolve('@ianvs/prettier-plugin-sort-imports'),
		require.resolve('prettier-plugin-sh'),
		require.resolve('prettier-plugin-svelte'),
		require.resolve('prettier-plugin-tailwindcss'), // MUST come last
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
	// overrides: [
	// 	{
	// 		files: ['README.md', 'packages/**/README.md'],
	// 		options: {
	// 			useTabs: false,
	// 			tabWidth: 2,
	// 		},
	// 	},
	// ],
}
export default config

export const kitql = () => {
	return config
}
