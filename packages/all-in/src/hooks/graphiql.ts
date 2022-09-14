import type { GraphiQLOptions as Options } from '@graphql-yoga/common'
import { renderGraphiQL } from '@graphql-yoga/common'
import type { Handle } from '@sveltejs/kit'

type GraphiQLOptions = Omit<Options, 'headers'> & {
  headers?: Record<string, string>

  /**
   * This is the path in the SvelteKit app
   * @default is '/api/graphiql'
   */
  path?: string
}

export function graphiql(options?: GraphiQLOptions): Handle {
  const { path, headers, ...opts } = {
    title: 'KitQL',
    endpoint: '/api/graphql',
    path: '/api/graphiql',
    ...options,
  }

  if (!path.startsWith('/')) {
    throw new Error("graphiql path must start with '/'")
  }

  const body = renderGraphiQL({
    ...opts,
    headers: JSON.stringify(headers ?? {}),
  })

  return ({ event, resolve }) => {
    if (event.url.pathname === path) {
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
