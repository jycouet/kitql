import type { Handle } from '@sveltejs/kit'

import { cors, type CorsOptions } from '$lib/utils/cors.js'
import { getMatchingOptionForURL, type OptionsByPath } from '$lib/utils/paths.js'

/**
 * Creates a handler which adds CORS headers to responses for requests matching a given path in
 * the given options. If multiple options entries would match a request, the first matching entry is
 * used.
 *
 * The behavior of the handler for a matching path is specified by the {@link CorsOptions} object
 * provided in the options.
 *
 * Of note, if a path match is found, the route exists, and no OPTIONS handler is defined for the
 * route, the handler will return a valid OPTIONS response with the appropriate CORS headers. This
 * obviates the need for an explicit OPTIONS handler in `+server.ts` endpoints.
 */
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
