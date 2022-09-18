import { createModule } from 'graphql-modules'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { resolvers } from './_kitql/resolvers'
import { typeDefs } from './_kitql/typedefs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const userModule = createModule({
  id: 'user-module',
  dirname: __dirname,
  typeDefs,
  resolvers,
})
