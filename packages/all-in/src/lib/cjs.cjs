function kitqlCodegen(projectLocation, scalars) {
  return {
    generates: {
      // [`${projectLocation}/src/lib/graphql/$kitql/graphqlTypes.ts`]: {
      //   plugins: ['typescript', 'typescript-resolvers'],
      //   config: {
      //     scalars,
      //   },
      // },
      [`./src/lib/modules/`]: {
        preset: 'graphql-modules',
        presetConfig: {
          baseTypesPath: '../graphql/$kitql/graphqlTypes.ts',
          importBaseTypesFrom: '$graphql/$kitql/graphqlTypes',
          filename: '$kitql/moduleTypes.ts',
        },
        plugins: ['typescript', 'typescript-resolvers'],
        config: {
          contextType: '$graphql/kitqlServer#IKitQLContext',
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

module.exports = function kitqlConfig(options) {
  const { projectLocation = '.', scalars = {} } = options || {}

  return {
    schema: [
      `${projectLocation}/src/lib/modules/**/typedefs/*.graphql`,
      `${projectLocation}/$houdini/graphql/schema.graphql`,
    ],
    documents: [
      `${projectLocation}/src/**/*.gql`,
      `${projectLocation}/src/**/*.svelte`,
      `${projectLocation}/$houdini/graphql/documents.gql`,
    ],
    extensions: {
      codegen: kitqlCodegen(projectLocation, scalars),
    },
  }
}
