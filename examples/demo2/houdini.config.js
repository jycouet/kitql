/** @type {import('houdini').ConfigFile} */
const config = {
	schemaPath: 'src/**/*.graphql',
	sourceGlob: 'src/**/*.{svelte,gql}',
	framework: 'kit',
	module: 'esm',
	scalars: {
		DateTime: {
			type: 'Date',
			unmarshal(val) {
				// to typescript type
				return new Date(val);
			},
			marshal(date) {
				// to graphql
				return date.toISOString();
			}
		}
	}
};

export default config;
