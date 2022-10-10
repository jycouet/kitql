import type { Handle } from '@sveltejs/kit'
import type { GraphiQLRendererOptions as GraphiQLYogaOptions } from 'graphql-yoga/typings/plugins/useGraphiQL'

export type GraphiQLKitQL = Omit<GraphiQLYogaOptions, 'headers' | 'endpoint'> & {
  headers?: Record<string, string>

  enabled?: boolean

  endpoint?: string

  /**
   * This is the graphiQLPath in the SvelteKit app
   * @default is '/graphiql'
   */
  graphiQLPath?: string
}

async function getGraphiQLBody(graphiqlOptions: GraphiQLYogaOptions) {
  try {
    // @ts-ignore
    const { renderGraphiQL: renderGraphiQLOffline } = await import('@graphql-yoga/render-graphiql')
    return renderGraphiQLOffline(graphiqlOptions)
  } catch (e: any) {
    // user did not add it as a dependency
    const { renderGraphiQL: renderGraphiQLOnline } = await import('graphql-yoga')
    return renderGraphiQLOnline(graphiqlOptions)
  }
}

export function handleGraphiql(options?: GraphiQLKitQL): Handle {
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
    if (enabled && event.url && event.url.pathname === graphiQLPath) {
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
