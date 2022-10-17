import type { CodegenConfig } from '@graphql-codegen/cli'
import type { IGraphQLProject } from 'graphql-config'

export interface KitQLProjects {
  projects: {
    [name: string]: IGraphQLProject
  }
}

export type KitQLConfig = {
  projectLocation?: string
  scalars?: KitQLScalar
}

export type KitQLScalar = Record<string, string>

function kitQLCodegen(projectLocation: string, scalars: KitQLScalar): CodegenConfig {
  return {
    generates: {
      [`${projectLocation}src/lib/graphql/$kitql/graphqlTypes.ts`]: {
        plugins: ['typescript'],
      },
      [`${projectLocation}src/lib/modules/`]: {
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
        },
      },
    },
    config: {
      useTypeImports: true,
    },
  }
}

export function kitQLConfig(options?: KitQLConfig): IGraphQLProject {
  const { projectLocation = './', scalars = {} } = options || {}

  return {
    schema: [
      `${projectLocation}src/lib/modules/**/typedefs/*.graphql`,
      `${projectLocation}$houdini/graphql/schema.graphql`,
    ],
    documents: [
      `${projectLocation}src/lib/modules/**/graphql/*.gql`,
      `${projectLocation}$houdini/graphql/documents.gql`,
    ],
    extensions: {
      codegen: kitQLCodegen(projectLocation, scalars),
    },
  }
}
