// Svelte Component
// export { default as KitQLInfo } from './KitQLInfo.svelte'

// graphql-modules
export { createModule } from 'graphql-modules'
export { kitQLModules } from './graphql/kitQLModules.js'

// SvelteKit hooks
export type { KitQLHandleGraphQL } from './hooks/graphql.js'
export { handleGraphql } from './hooks/graphql.js'
export type { KitQLHandleGraphiQL } from './hooks/graphiql.js'
export { handleGraphiql } from './hooks/graphiql.js'

// Prisma
// export { getKitQLPrisma } from './prisma/kitQLPrisma'

// GraphQL Config
export type { CodegenConfig as KitQLCodegenConfig } from '@graphql-codegen/cli'
export type { IGraphQLProject as KitQLProject } from 'graphql-config'
export type { KitQLProjects, KitQLConfig, KitQLScalar } from './graphql/graphqlConfig.js'
export { kitQLConfig } from './graphql/graphqlConfig.js'

// vite plugin
export { kitql } from './vite/plugin.js'
