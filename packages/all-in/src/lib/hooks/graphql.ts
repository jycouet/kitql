import type { YogaServerInstance } from '@graphql-yoga/common'
import type { Handle } from '@sveltejs/kit'

export type GraphQLOptions = {
  endpoint?: string

  /**
   * If you set the `graphiQLPath`, on a GET request you will be redirected there
   * If not, you will get a 404 (security by default ;))))))))))))))))))
   */
  graphiQLPath?: string
}

export function graphql<TServerContext, TUserContext, TRootValue>(
  kitqlServer: YogaServerInstance<TServerContext, TUserContext, TRootValue>,
  options?: GraphQLOptions
): Handle {
  const { endpoint, graphiQLPath } = {
    endpoint: '/graphql',
    graphiQLPath: undefined,
    ...options,
  }

  if (!endpoint.startsWith('/')) {
    throw new Error("graphql endpoint must start with '/'")
  }

  if (graphiQLPath && !graphiQLPath.startsWith('/')) {
    throw new Error("graphiQLPath path must start with '/'")
  }

  return ({ event, resolve }) => {
    if (event.url.pathname === endpoint) {
      if (event.request.method === 'GET') {
        // If we know graphiQLPath, let's go there
        if (graphiQLPath) {
          return new Response('Redirect', { status: 303, headers: { Location: graphiQLPath } })
        }
        // if not, let's bring the 404!
        return new Response(`${endpoint} Not found`, { status: 404 })
      }

      if (event.request.method === 'POST') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return kitqlServer.handleRequest(event.request)
      }
    }

    // Fallback to normal request
    return resolve(event)
  }
}
