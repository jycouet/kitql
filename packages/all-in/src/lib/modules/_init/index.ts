import { createModule } from 'graphql-modules'
import { resolvers } from './$kitql/resolvers'
import { typeDefs } from './$kitql/typedefs'

export const _initModule = createModule({
  id: 'init-module',
  typeDefs,
  resolvers,
})
