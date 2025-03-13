import { error, type Handle, type RequestEvent } from '@sveltejs/kit'

import { Log } from '@kitql/helpers'

import type { OptionsByStringPath } from '$lib/utils/paths.js'

// from @sveltejs/kit
export type MaybePromise<T> = T | Promise<T>

const log = new Log('handleProxies')

export interface ProxyOptions {
	to: string
	requestHook?: (event: RequestEvent) => MaybePromise<Request>
}

/**
 * Fetches a request, optionally using a proxied URL. If a proxied URL is provided, the request is
 * made to that URL with the same method, body, and headers as the original request, with the `host`
 * header set to the hostname of the target proxied URL. If no proxied URL is provided, the request
 * is made to the original request URL.
 *
 * If the fetch fails, the error is logged and rethrown.
 */
async function fetchMaybeProxiedRequest(
	fetch: RequestEvent['fetch'],
	request: Request,
	proxiedUrl?: string,
): Promise<Response> {
	const url = proxiedUrl ?? request.url
	const requestHeaders = new Headers(request.headers)
	if (proxiedUrl != null) {
		requestHeaders.set('host', new URL(proxiedUrl).hostname)
	}
	const response = await fetch(url, {
		body: request.body,
		method: request.method,
		headers: requestHeaders,
		// typescript does not yet support the `duplex` property of `RequestInit`
		// see: https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1483
		// @ts-expect-error
		duplex: 'half',
	}).catch((err) => {
		console.error(err)
		log.error('handleProxies ERROR')
		throw err
	})

	// Create a new response with modified headers
	const newHeaders = new Headers(response.headers)

	// Remove the Content-Encoding header to prevent decoding issues
	newHeaders.delete('Content-Encoding')

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders,
	})
}

/**
 * Creates a handler which, for requests matching a given path prefix in the given options, proxies
 * the request to the `to` URL in the corresponding {@link ProxyOptions}. Any path elements after
 * the matching prefix are preserved, e.g. a request to `/from/some/other/path` will be proxied to
 * `to/some/other/path`. The request method, body, and headers are preserved, with the exception of
 * the `Host` header which is set to the proxy target hostname.
 *
 * If a `requestHook` is defined, it is called with the original request event before the returned
 * request is proxied. This allows for modifying the request before it is sent, e.g. to add or
 * remove authentication headers, api keys, etc. If the returned request is to a URL with the same
 * origin as the initial request and a path that also starts with the matched path prefix, that
 * request path is proxied; otherwise, the returned request path is not modified before it is
 * fetched. If the `requestHook` function throws, the request is not proxied and a response
 * corresponding to the thrown object (matching Sveltekit endpoint behavior) is returned to the
 * client instead.
 *
 * If multiple options entries would match a request, the first matching entry is used.
 *
 * For requests matching a path prefix in options that do not have an `Origin` header or that have
 * an `Origin` header not matching the request's origin, a 403 Forbidden response is returned. This
 * prevents use of the proxy by other browser applications, but (IMPORTANT) does not prevent abuse
 * of the proxy by applications that can set the `Origin` header manually to match. To prevent this,
 * you can require user authentication and authorization before allowing proxying, validating an
 * incoming request either in a preceding hook or directly in the `requestHook`.
 */
export function handleProxies(options: OptionsByStringPath<ProxyOptions>): Handle {
	return async ({ event, resolve }) => {
		const matchingPathAndOptions = options.find(([path]) => event.url.pathname.startsWith(path))
		if (!matchingPathAndOptions) {
			return resolve(event)
		}

		const [from, { to, requestHook }] = matchingPathAndOptions
		const origin = event.request.headers.get('Origin')
		// reject requests that don't come from the webapp, to avoid your proxy being abused.
		if (!origin || new URL(origin).origin !== event.url.origin) {
			error(403, 'Forbidden')
		}

		let request = event.request
		// if a requestHook is defined, call it with the original request event. any errors thrown by
		// `requestHook` will be caught by sveltekit and handled as though they were thrown by an
		// endpoint
		if (requestHook != null) {
			request = await requestHook(event)
		}
		const url = new URL(request.url)
		// If the requestHook returns a request with a different origin or a path not from this
		// working prefix, perform the request as-is
		if (url.origin !== event.url.origin || !url.pathname.startsWith(from)) {
			return fetchMaybeProxiedRequest(event.fetch, request)
		}

		// strip "from" from the request path
		const strippedPath = url.pathname.substring(from.length)
		// build the new URL and request
		const urlPath = `${to}${strippedPath}${url.search}`
		const proxiedUrl = new URL(urlPath).toString()
		return fetchMaybeProxiedRequest(event.fetch, request, proxiedUrl)
	}
}
