import { dev } from '$app/environment'
import { kitqlServer } from '$lib/graphql/kitQLServer'
import { handleGraphiql } from '$lib/hooks/graphiql'
import { handleGraphql } from '$lib/hooks/graphql'
import { sequence } from '@sveltejs/kit/hooks'

// 1/ With all default options
export const handle = sequence(
  // create the graphql endpoint
  handleGraphql(kitqlServer()),

  // enable graphiql in dev mode
  handleGraphiql({
    enabled: dev,
  })
)

// 2/ With custom options
// const endpoint = '/graphql'
// const graphiQLPath = '/graphiql'

// export const handle = sequence(
//   // create the graphql endpoint
//   handleGraphql(kitqlServer({ endpoint }), { graphiQLPath }),

//   // enable graphiql in dev mode
//   handleGraphiql({
//     enabled: dev,
//     graphiQLPath,
//   })
// )
