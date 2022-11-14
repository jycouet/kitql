import { createModule } from 'graphql-modules'

import { typeDefs } from './$kitql/typedefs'

export const _enumsModule = createModule({
  id: 'enums-module',
  typeDefs,
})
