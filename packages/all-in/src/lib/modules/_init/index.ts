import { createModule } from 'graphql-modules'
import { resolvers } from './_kitql/resolvers'
import { typeDefs } from './_kitql/typedefs'

export const _initModule = createModule({
  id: 'init-module',
  typeDefs,
  resolvers,
})
