import type { GraphiQLOptions as Options } from '@graphql-yoga/common'
import { renderGraphiQL as renderGraphiQLOnline } from '@graphql-yoga/common'
import type { Handle } from '@sveltejs/kit'

export type GraphiQLOptions = Omit<Options, 'headers'> & {
  headers?: Record<string, string>

  enabled?: boolean

  /**
   * This is the graphiQLPath in the SvelteKit app
   * @default is '/graphiql'
   */
  graphiQLPath?: string
}

export async function handleGraphiql(options?: GraphiQLOptions): Promise<Handle> {
  const { graphiQLPath, headers, enabled, ...opts } = {
    title: 'KitQL',
    endpoint: '/graphql',
    graphiQLPath: '/graphiql',
    enabled: true,
    ...options,
  }

  if (!graphiQLPath.startsWith('/')) {
    throw new Error("graphiql graphiQLPath must start with '/'")
  }

  const graphiqlOptions = {
    ...opts,
    headers: JSON.stringify(headers ?? {}),
  }

  let body = ''
  try {
    const { renderGraphiQL: renderGraphiQLOffline } = await import('@graphql-yoga/render-graphiql')
    body = renderGraphiQLOffline(graphiqlOptions)
  } catch (err) {
    // user did not add it as a dependency
    body = renderGraphiQLOnline(graphiqlOptions)
  }

  return ({ event, resolve }) => {
    if (enabled && event.url.pathname === graphiQLPath) {
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
