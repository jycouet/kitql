import type { Handle } from '@sveltejs/kit'
import { DEV } from 'esm-env'

import { Log } from '@kitql/helpers'

import { httpErrorResponse } from '$lib/utils/hook-error.js'

const log = new Log('handleProxies')

export type ProxyDefinition = { from: string; to: string }
export type HandleProxiesOptions = { proxies: ProxyDefinition[] }

/**
 * Creates a handler which, for requests matching a given `from` prefix in the given options,
 * proxies the request to the `to` URL. Any path elements after the matching prefix are preserved,
 * e.g. a request to `/from/some/other/path` will be proxied to `to/some/other/path`. The request
 * method, body, and headers are preserved, with the exception of the `Host` header which is set to
 * the proxy target hostname.
 *
 * If multiple options entries match a request, the first matching entry is used, and a warning is
 * logged in development.
 */
export function handleProxies({ proxies }: HandleProxiesOptions): Handle {
  return async ({ event, resolve }) => {
    const proxies_found = proxies.filter((c) => event.url.pathname.startsWith(c.from))

    // We should not find more than 1
    if (proxies_found.length > 0) {
      if (proxies_found.length > 1 && DEV) {
        log.error('Multiple proxies found', event.url.pathname)
      }
      const proxy = proxies_found[0]

      const origin = event.request.headers.get('Origin')

      // reject requests that don't come from the webapp, to avoid your proxy being abused.
      if (!origin || new URL(origin).origin !== event.url.origin) {
        return httpErrorResponse(event.request, 403, 'Forbidden')
      }

      // strip "from" from the request path
      const strippedPath = event.url.pathname.substring(proxy.from.length)

      // build the new URL
      const urlPath = `${proxy.to}${strippedPath}${event.url.search}`
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

    return resolve(event)
  }
}
