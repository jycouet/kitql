// Svelte Component
// export { default as KitQLInfo } from './KitQLInfo.svelte'

// graphql-modules
export { createModule } from 'graphql-modules'
export { kitQLModules } from './graphql/kitQLModules'

// SvelteKit hooks
export { type KitQLHandleGraphQL } from './hooks/graphql'
export { handleGraphql } from './hooks/graphql'
export { type KitQLHandleGraphiQL } from './hooks/graphiql'
export { handleGraphiql } from './hooks/graphiql'

// Prisma
// export { getKitQLPrisma } from './prisma/kitQLPrisma'

// GraphQL Config
export type { CodegenConfig as KitQLCodegenConfig } from '@graphql-codegen/cli'
export type { IGraphQLProject as KitQLProject } from 'graphql-config'
export type { KitQLProjects, KitQLConfig, KitQLScalar } from './graphql/graphqlConfig'
export { kitQLConfig } from './graphql/graphqlConfig'

// vite plugin
export { kitql } from './vite/plugin'
