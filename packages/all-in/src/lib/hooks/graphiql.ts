import type { GraphiQLOptions as Options } from '@graphql-yoga/common'
import { renderGraphiQL } from '@graphql-yoga/common'
import type { Handle } from '@sveltejs/kit'

export type GraphiQLOptions = Omit<Options, 'headers'> & {
  headers?: Record<string, string>

  /**
   * This is the graphiQLPath in the SvelteKit app
   * @default is '/graphiql'
   */
  graphiQLPath?: string
}

export function graphiql(options?: GraphiQLOptions): Handle {
  const { graphiQLPath, headers, ...opts } = {
    title: 'KitQL',
    endpoint: '/graphql',
    graphiQLPath: '/graphiql',
    ...options,
  }

  if (!graphiQLPath.startsWith('/')) {
    throw new Error("graphiql graphiQLPath must start with '/'")
  }

  const body = renderGraphiQL({
    ...opts,
    headers: JSON.stringify(headers ?? {}),
  })

  return ({ event, resolve }) => {
    if (event.url.pathname === graphiQLPath) {
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }

    // Fallback to normal request
    return resolve(event)
  }
}
