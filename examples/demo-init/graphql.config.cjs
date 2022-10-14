/** @type {import('@graphql-codegen/cli').CodegenConfig} */
function kitQLCodegen(projectLocation, scalars) {
	return {
		generates: {
			[`${projectLocation}src/lib/graphql/$kitql/graphqlTypes.ts`]: {
				plugins: ['typescript']
			},
			[`${projectLocation}src/lib/modules/`]: {
				preset: 'graphql-modules',
				presetConfig: {
					baseTypesPath: '../graphql/$kitql/graphqlTypes.ts',
					importBaseTypesFrom: '$graphql/$kitql/graphqlTypes',
					filename: '$kitql/moduleTypes.ts'
				},
				plugins: ['typescript', 'typescript-resolvers'],
				config: {
					contextType: '$graphql/kitQLServer#IKitQLContext',
					scalars
				}
			}
		},
		config: {
			useTypeImports: true
		}
	};
}

function kitQLConfig(projectLocation, scalars) {
	return {
		schema: [
			`${projectLocation}src/lib/modules/**/typedefs/*.graphql`,
			`${projectLocation}$houdini/graphql/schema.graphql`
		],
		documents: [
			`${projectLocation}src/lib/modules/**/graphql/*.gql`,
			`${projectLocation}$houdini/graphql/documents.gql`
		],
		extensions: {
			codegen: kitQLCodegen(projectLocation, scalars)
		}
	};
}

const scalars = {
	Date: '../helpers/scalarTypes#CodegenDate',
	DateTime: 'Date'
};

/** @type {import('graphql-config').IGraphQLProjects} */
const config = {
	projects: {
		init: kitQLConfig('./', scalars)
	}
};

module.exports = config;
