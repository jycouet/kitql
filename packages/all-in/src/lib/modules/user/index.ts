import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createModule } from 'graphql-modules'

import { resolvers } from './$kitql/resolvers'
import { typeDefs } from './$kitql/typedefs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const userModule = createModule({
  id: 'user-module',
  dirname: __dirname,
  typeDefs,
  resolvers,
})
