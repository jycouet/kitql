import { useEngine } from '@envelop/core'
import type { Handle } from '@sveltejs/kit'
import * as GraphQLJS from 'graphql'
import { createSchema, createYoga, type Plugin, type YogaInitialContext } from 'graphql-yoga'

export type KitQLHandleGraphQL<TUserContext, TServerContext extends Record<string, any>> = {
  /**
   * The path to access your own GraphqiQL.
   *
   * Note that you will need to add `handleGraphiql` to have it working.
   *
   * **Default**: `undefined`
   *
   * ---
   * _Note:_ By default graphiQLPath is undefined, so you will get a 404 on a GET request. (Security by default)
   */
  graphiQLPath?: string

  /**
   * The path to your graphql endpoint
   *
   * **Default**: `/api/graphql`
   */
  endpoint?: string

  /**
   * THE context.
   */
  context?:
    | ((initialContext: YogaInitialContext & TServerContext) => Promise<TUserContext> | TUserContext)
    | Promise<TUserContext>
    | TUserContext

  /**
   * List of plugins.
   */
  plugins?: Plugin[]
}

export function handleGraphql<TUserContext, TServerContext>(
  options?: KitQLHandleGraphQL<TUserContext, TServerContext>
): Handle {
  // set defaults
  const { graphiQLPath, endpoint, plugins, context } = {
    graphiQLPath: undefined,
    endpoint: '/api/graphql',
    plugins: [],
    context: () => {
      return {} as TUserContext
    },
    ...options,
  }

  if (!endpoint.startsWith('/')) {
    throw new Error("graphql endpoint must start with '/'")
  }

  if (graphiQLPath && !graphiQLPath.startsWith('/')) {
    throw new Error("graphiQLPath path must start with '/'")
  }

  // defaults plugins of kitql
  const kitqlPlugins = [useEngine(GraphQLJS)]

  const kitqlServer = createYoga<YogaInitialContext, TUserContext>({
    logging: true,
    // will be overwritten by modules
    schema: createSchema({
      typeDefs: `
        type Query {
          _greetings: String
        }
      `,
      resolvers: {
        Query: {
          _greetings: () =>
            'Yes yoga is up and running! Now, to make it work with your own schema, you need to `useKitqlModules(modules)` via plugins',
        },
      },
    }),
    context,
    plugins: kitqlPlugins.concat(plugins || []),
    graphqlEndpoint: endpoint,
    fetchAPI: globalThis,
  })

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
