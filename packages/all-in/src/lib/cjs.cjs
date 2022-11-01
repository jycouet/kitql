function kitQLCodegen(scalars) {
  return {
    generates: {
      [`./src/lib/graphql/$kitql/graphqlTypes.ts`]: {
        plugins: ['typescript', 'typescript-resolvers'],
        config: {
          scalars,
        },
      },
      [`./src/lib/modules/`]: {
        preset: 'graphql-modules',
        presetConfig: {
          baseTypesPath: '../graphql/$kitql/graphqlTypes.ts',
          importBaseTypesFrom: '$graphql/$kitql/graphqlTypes',
          filename: '$kitql/moduleTypes.ts',
        },
        plugins: ['typescript', 'typescript-resolvers'],
        config: {
          contextType: '$graphql/kitQLServer#IKitQLContext',
          scalars,
          useTypeImports: true,
        },
      },
    },
    config: {
      useTypeImports: true,
      enumsAsTypes: true,
    },
  }
}

module.exports = function kitQLConfig(options) {
  const { projectLocation = '.', scalars = {} } = options || {}

  return {
    schema: [
      `${projectLocation}/src/lib/modules/**/typedefs/*.graphql`,
      `${projectLocation}/$houdini/graphql/schema.graphql`,
    ],
    documents: [`${projectLocation}/src/**/*.gql`, `${projectLocation}/$houdini/graphql/documents.gql`],
    extensions: {
      codegen: kitQLCodegen(scalars),
    },
  }
}
