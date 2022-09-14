import { createServer } from '@graphql-yoga/common'
import { sequence } from '@sveltejs/kit/hooks'
import { graphiql } from './graphiql'
import { graphql } from './graphql'

const kitqlServer = createServer({
  //logging: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //context: getContext as any, //Context will be typed in each resolver with IYogaContext (under)
  // plugins
})

export const handle = sequence(graphql(kitqlServer), graphiql())
