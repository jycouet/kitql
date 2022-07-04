/** @type {import('houdini').ConfigFile} */
const config = {
	schemaPath: 'src/lib/graphql/schema.json',
	sourceGlob: 'src/**/*.{svelte,gql}',
	scalars: {
		URI: {
			type: 'string'
		}
	},
	disableMasking: true
};

export default config;
