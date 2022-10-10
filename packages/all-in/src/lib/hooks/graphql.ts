import type { YogaServerInstance } from 'graphql-yoga'
import type { Handle } from '@sveltejs/kit'

export type KitQLCreateServerOptions = {
  /**
   * defaults to /graphql
   */
  endpoint?: string
}

export type GraphQLOptions = {
  /**
   * If you set the `graphiQLPath`, on a GET request you will be redirected there
   * If not, you will get a 404 (security by default ;))))))))))))))))))
   */
  graphiQLPath?: string
}

export function handleGraphql<TServerContext, TUserContext>(
  kitqlServer: YogaServerInstance<TServerContext, TUserContext>,
  options?: GraphQLOptions
) {
  const endpoint = kitqlServer.graphqlEndpoint

  const { graphiQLPath } = {
    graphiQLPath: undefined,
    ...options,
  }

  if (!endpoint.startsWith('/')) {
    throw new Error("graphql endpoint must start with '/'")
  }

  if (graphiQLPath && !graphiQLPath.startsWith('/')) {
    throw new Error("graphiQLPath path must start with '/'")
  }

  return async ({ event, resolve }) => {
    if (event.url && event.url.pathname === endpoint) {
      if (event.request.method === 'GET') {
        // If we know graphiQLPath, let's go there
        if (graphiQLPath) {
          return new Response('Redirect', { status: 303, headers: { Location: graphiQLPath } })
        }
        // if not, let's bring the 404!
        return new Response(`${endpoint} Not found`, { status: 404 })
      }

      if (event.request.method === 'POST') {
        return kitqlServer.handleRequest(event.request, null)
      }
    }

    // Fallback to normal request
    return resolve(event)
  }
}
