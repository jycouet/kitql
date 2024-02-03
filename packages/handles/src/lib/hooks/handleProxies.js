import { error } from '@sveltejs/kit'

import { Log } from '@kitql/helpers'

/**
 * usage:
 *	import { sequence } from '@sveltejs/kit/hooks';
 *	import { handleProxies } from '@kitql/handles'
 *
 *	export const handle = sequence(
 *		// Proxy requests through kit
 *		handleProxies({ proxies: [{ from: "/proxy", to: "http://my.super.website/graphql" }] }),
 *	);
 *
 * @param {import('./handleProxies.t.js').handleProxiesOptions} options
 */
export const handleProxies = (options) => {
  /** @type {import('@sveltejs/kit').Handle} */
  return async ({ event, resolve }) => {
    const proxies_found = options.proxies.filter((c) => event.url.pathname.startsWith(c.from))

    // We should not find more than 1
    if (proxies_found.length > 1) {
      error(
        403,
        JSON.stringify({
          error: 'Multiple proxies found',
          proxies_found,
          url: event.url.pathname,
        }),
      )
    }
    // We find one, perfect, let's use it
    else if (proxies_found.length === 1) {
      const proxy = proxies_found[0]

      const origin = event.request.headers.get('Origin')

      // reject requests that don't come from the webapp, to avoid your proxy being abused.
      if (!origin || new URL(origin).origin !== event.url.origin) {
        error(403, 'Request Forbidden.')
      }

      // strip "from" from the request path
      const strippedPath = event.url.pathname.substring(proxy.from.length)

      // build the new URL
      const urlPath = `${proxy.to}${strippedPath}${event.url.search}`
      const proxiedUrl = new URL(urlPath)

      return event
        .fetch(proxiedUrl.toString(), {
          body: event.request.body,
          method: event.request.method,
          headers: event.request.headers,
          // @ts-ignore
          duplex: 'half',
        })
        .catch((err) => {
          const log = new Log('handleProxies')
          console.error(err)
          log.error('handleProxies ERROR')
          throw err
        })
    }

    // Fallback to normal request
    return resolve(event)
  }
}
