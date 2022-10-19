// Svelte Component
// export { default as KitQLInfo } from './KitQLInfo.svelte'

// graphql-modules
export { createModule } from 'graphql-modules'
export { kitQLModules } from './graphql/kitQLModules.js'

// SvelteKit hooks
export { type KitQLHandleGraphQL, handleGraphql } from './hooks/graphql.js'
export { type KitQLHandleGraphiQL, handleGraphiql } from './hooks/graphiql.js'

// Prisma
// export { getKitQLPrisma } from './prisma/kitQLPrisma'

// GraphQL Config
export type { CodegenConfig as KitQLCodegenConfig } from '@graphql-codegen/cli'
export type { IGraphQLProject as KitQLProject } from 'graphql-config'
export { type KitQLProjects, type KitQLConfig, type KitQLScalar } from './graphql/graphqlConfig.js'
// To make it available for GrapQL Vs Code extension!
module.exports = './graphql/cjs/graphqlConfig.cjs'

// GraphQL Helper
export { rootFields } from './graphql/helper.js'

// vite plugin
export { kitql } from './vite/plugin.js'
