import type * as gm from 'graphql-modules'

// Svelte Component
// export { default as KitQLInfo } from './KitQLInfo.svelte'

// graphql-modules
export { createModule as kitqlModules, gql as gql } from 'graphql-modules'
export { useKitqlModules } from './graphql/useKitqlModules.js'
export { gm }

// SvelteKit hooks
export { type KitQLHandleGraphQL, handleGraphql } from './hooks/graphql.js'
export { type KitQLHandleGraphiQL, handleGraphiql } from './hooks/graphiql.js'

// Prisma
// export { getKitQLPrisma } from './prisma/kitQLPrisma'

// GraphQL Config
export type { CodegenConfig as KitQLCodegenConfig } from '@graphql-codegen/cli'
export type { IGraphQLProject as KitQLProject } from 'graphql-config'
export type { KitQLProjects, KitQLConfig, KitQLScalar } from './graphql/graphqlConfig.js'

// GraphQL Helper
export { rootFields } from './graphql/helper.js'

// vite plugin
export { kitql } from './vite/plugin.js'
export type { KitQLVite } from './vite/KitQLVite.js'

// graphql-yoga
export type { Plugin as YogaPlugin } from 'graphql-yoga'
