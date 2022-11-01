import { useEngine } from '@envelop/core'
import type { Handle } from '@sveltejs/kit'
import * as GraphQLJS from 'graphql'
import { createSchema, createYoga, type Plugin, type YogaInitialContext } from 'graphql-yoga'

export type KitQLHandleGraphQL<TUserContext, TServerContext extends Record<string, any>> = {
  /**
   * If you set the `graphiQLPath`, on a GET request you will be redirected there
   * If not, you will get a 404 (security by default ;))))))))))))))))))
   */
  graphiQLPath?: string
  /**
   * defaults to /graphql
   */
  endpoint?: string

  context?:
    | ((initialContext: YogaInitialContext & TServerContext) => Promise<TUserContext> | TUserContext)
    | Promise<TUserContext>
    | TUserContext

  // context?:
  //   | ((initialContext: YogaInitialContext) => Promise<TUserContext> | TUserContext)
  //   | Promise<TUserContext>
  //   | TUserContext

  plugins?: Plugin[]
}

export function handleGraphql<TUserContext, TServerContext>(
  options?: KitQLHandleGraphQL<TUserContext, TServerContext>
): Handle {
  // set defaults
  const { graphiQLPath, endpoint, plugins, context } = {
    graphiQLPath: undefined,
    endpoint: '/graphql',
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
          is_it_working: String
        }
      `,
      resolvers: {
        Query: {
          is_it_working: () =>
            'Yes yoga is up and running! Now, to make it work with your own schema, you need to send kitQLModules(modules) via plugins',
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
