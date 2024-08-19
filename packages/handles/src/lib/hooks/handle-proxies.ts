import { error, type Handle } from '@sveltejs/kit'

import { Log } from '@kitql/helpers'

import type { OptionsByStringPath } from '$lib/utils/paths.js'

const log = new Log('handleProxies')

export interface ProxyOptions {
  to: string
}

/**
 * Creates a handler which, for requests matching a given path prefix in the given options,
 * proxies the request to the `to` URL in the corresponding {@link ProxyOptions}. Any path elements
 * after the matching prefix are preserved, e.g. a request to `/from/some/other/path` will be
 * proxied to `to/some/other/path`. The request method, body, and headers are preserved, with the
 * exception of the `Host` header which is set to the proxy target hostname.
 *
 * If multiple options entries would match a request, the first matching entry is used.
 */
export function handleProxies(options: OptionsByStringPath<ProxyOptions>): Handle {
  return async ({ event, resolve }) => {
    const matchingPathAndOptions = options.find(([path]) => event.url.pathname.startsWith(path))
    if (!matchingPathAndOptions) {
      return resolve(event)
    }

    const [from, { to }] = matchingPathAndOptions
    const origin = event.request.headers.get('Origin')
    // reject requests that don't come from the webapp, to avoid your proxy being abused.
    if (!origin || new URL(origin).origin !== event.url.origin) {
      error(403, 'Forbidden')
    }

    // strip "from" from the request path
    const strippedPath = event.url.pathname.substring(from.length)
    // build the new URL and request
    const urlPath = `${to}${strippedPath}${event.url.search}`
    const proxiedUrl = new URL(urlPath)
    const requestHeaders = new Headers(event.request.headers)
    requestHeaders.set('host', event.url.hostname)

    return event
      .fetch(proxiedUrl.toString(), {
        body: event.request.body,
        method: event.request.method,
        headers: requestHeaders,
        // typescript does not yet support the `duplex` property of `RequestInit`
        // see: https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1483
        // @ts-expect-error
        duplex: 'half',
      })
      .catch((err) => {
        console.error(err)
        log.error('handleProxies ERROR')
        throw err
      })
  }
}
