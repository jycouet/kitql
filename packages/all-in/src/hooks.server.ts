import { dev } from '$app/environment'
import { type IKitQLContext, kitqlServer } from '$lib/graphql/kitqlServer'
import { handleGraphiql } from '$lib/hooks/graphiql'
import { handleGraphql } from '$lib/hooks/graphql'
import type { RequestEvent } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

/**
 * 1/ With all default options
 */
export const handle = sequence(
  // create the graphql endpoint
  handleGraphql<IKitQLContext, RequestEvent>(kitqlServer),

  // enable graphiql in dev mode
  handleGraphiql({
    enabled: dev,
  }),
)

/**
 * 2/ With custom options
 */
// const endpoint = '/graphql'
// const graphiQLPath = '/graphiql'

// export const handle = sequence(
//   // create the graphql endpoint
//   handleGraphql<IKitQLContext, RequestEvent>({
//     endpoint,
//     graphiQLPath,
//     ...kitqlServer,
//   }),

//   // enable graphiql in dev mode
//   handleGraphiql({
//     enabled: dev,
//     endpoint,
//     graphiQLPath,
//   })
// )
