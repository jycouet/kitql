import type * as gm from 'graphql-modules'

// Svelte Component
// export { default as KitQLInfo } from './KitQLInfo.svelte'

// graphql-modules
export {
  createModule as kitqlModules,
  gql as gql,
  CONTEXT as CONTEXT,
  Inject as Inject,
  Injector as Injector,
  Injectable as Injectable,
  Scope as Scope,
  InjectionToken as InjectionToken,
} from 'graphql-modules'
export { useKitqlModules } from './graphql/useKitqlModules.js'
export { gm }

// SvelteKit hooks
export { type KitQLHandleGraphQL, handleGraphql } from './hooks/graphql.js'
export { handleGraphiql } from './hooks/graphiql.js'
export type { KitQLHandleGraphiQL } from './hooks/graphiqlCommon.js'

// Prisma
// export { getKitQLPrisma } from './prisma/kitqlPrisma'

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
export { createSchema as createSchema } from 'graphql-yoga'
