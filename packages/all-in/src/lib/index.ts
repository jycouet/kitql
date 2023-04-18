import type * as gm from 'graphql-modules'

// graphql-modules
export { useKitqlModules } from './graphql/useKitqlModules.js'
export {
  CONTEXT as CONTEXT,
  gql as gql,
  Inject as Inject,
  Injectable as Injectable,
  InjectionToken as InjectionToken,
  Injector as Injector,
  createModule as kitqlModules,
  Scope as Scope,
} from 'graphql-modules'
export type { Next as Next } from 'graphql-modules/shared/middleware'
export { gm }

// SvelteKit hooks
export type { KitQLHandleGraphiQL } from './hooks/graphiqlCommon.js'
export { handleGraphiql as handleGraphiql } from './hooks/graphiql.js'
export type { KitQLHandleGraphQL } from './hooks/graphql.js'
export { handleGraphql as handleGraphql } from './hooks/graphql.js'

// Prisma
// export { getKitQLPrisma } from './prisma/kitqlPrisma'

// GraphQL Config
export type { KitQLConfig, KitQLProjects, KitQLScalar } from './graphql/graphqlConfig.js'
export type { CodegenConfig as KitQLCodegenConfig } from '@graphql-codegen/cli'
export type { IGraphQLProject as KitQLProject } from 'graphql-config'

// GraphQL Helper
export { rootFields } from './graphql/helper.js'

// vite plugin
export type { KitQLVite } from './vite/KitQLVite.js'
export { kitql } from './vite/plugin.js'

// graphql-yoga
export type { Plugin as YogaPlugin } from 'graphql-yoga'
export { createSchema as createSchema } from 'graphql-yoga'
