import type { GraphiQLOptions as Options } from '@graphql-yoga/common'
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

async function getGraphiQLBody(graphiqlOptions: Options) {
  try {
    const { renderGraphiQL: renderGraphiQLOffline } = await import('@graphql-yoga/render-graphiql')
    return renderGraphiQLOffline(graphiqlOptions)
  } catch (e: any) {
    // user did not add it as a dependency
    const { renderGraphiQL: renderGraphiQLOnline } = await import('@graphql-yoga/common')
    return renderGraphiQLOnline(graphiqlOptions)
  }
}

export function handleGraphiql(options?: GraphiQLOptions): Handle {
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

  const bodyPromise = enabled
    ? getGraphiQLBody({
        ...opts,
        headers: JSON.stringify(headers ?? {}),
      })
    : ''

  return async ({ event, resolve }) => {
    if (enabled && event.url.pathname === graphiQLPath) {
      return new Response(await bodyPromise, {
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
