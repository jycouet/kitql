/** @type {import('houdini').ConfigFile} */
const config = {
	client: 'src/lib/graphql/houdiniClient.ts',
	schemaPath: 'src/**/*.graphql',
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
