import type { Handle } from '@sveltejs/kit'
import type { GraphiQLRendererOptions as GraphiQLYogaOptions } from 'graphql-yoga/typings/plugins/useGraphiQL'

import { type KitQLHandleGraphiQL,defaultQuery } from './graphiqlCommon.js'

async function getGraphiQLBody(graphiqlOptions: GraphiQLYogaOptions) {
  try {
    // @ts-ignore
    const { renderGraphiQL: renderGraphiQLOffline } = await import('@graphql-yoga/render-graphiql')
    return renderGraphiQLOffline(graphiqlOptions)
  } catch (e: any) {
    console.error("You should have '@graphql-yoga/render-graphiql' as a dependency")
  }
}

export function handleGraphiqlOffline(options?: KitQLHandleGraphiQL): Handle {
  const { graphiQLPath, headers, enabled, ...opts } = {
    title: 'KitQL',
    endpoint: '/api/graphql',
    graphiQLPath: '/api/graphiql',
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
        defaultQuery,
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
