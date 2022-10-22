/// <references types="houdini-svelte">

/** @type {import('houdini').ConfigFile} */
const config = {
	schemaPath: 'src/**/*.graphql',

	plugins: {
		'houdini-svelte': {
			client: 'src/lib/graphql/houdiniClient.ts'
		}
	},

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
