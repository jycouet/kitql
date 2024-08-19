import type { Handle } from '@sveltejs/kit'

import { cors, type CorsOptions } from '$lib/utils/cors.js'
import { getMatchingOptionForURL, type OptionsByPath } from '$lib/utils/paths.js'

export function handleCors(options: OptionsByPath<CorsOptions>): Handle {
  return async ({ event, resolve }) => {
    const url = event.url
    const corsOptions = getMatchingOptionForURL(url, options)

    if (corsOptions) {
      let response = await resolve(event)
      if (event.request.method === 'OPTIONS' && response.status === 405) {
        // This route exists, but the OPTIONS method is not allowed (likely because an explicit
        // OPTIONS handler was not defined in `+server.ts`). Return an empty response with the
        // appropriate status code.
        response = new Response(null, { status: corsOptions.optionsStatusSuccess ?? 204 })
      }
      cors(corsOptions, event.request, response)
      return response
    }

    return resolve(event)
  }
}
