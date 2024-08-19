import type { Handle } from '@sveltejs/kit'

import { isOriginAllowed, type AllowedOrigin } from '$lib/utils/origins.js'
import { getMatchingOptionForURL, type OptionsByPath } from '$lib/utils/paths.js'

import { httpErrorResponse } from './hook-error.js'

/**
 * Defines an `AllowedOrigin` specification to limit the origins from which the form submissions are
 * allowed. If set to `true`, all origins are allowed.
 */
export interface CsrfOptions {
  origin: AllowedOrigin
}

/**
 * Creates a handler which blocks cross-site form submissions not explicitly enabled by the given
 * options. The logic is ported from the native SvelteKit CSRF prevention logic, with the addition
 * of the ability to selectively disable this protection for specific routes and (optionally) limit
 * the allowed request origins for cross-site form submissions for those routes. See:
 * https://github.com/sveltejs/kit/blob/008056b6ef33b554f8b03131c2635cc14b677ff1/packages/kit/src/runtime/server/respond.js#L63
 *
 * If a form submission request's origin does not match the target URL origin, the request is
 * checked against the provided options. If the request's path matches a `path` in the options, and
 * the request origin is allowed by the `origin` in the options, the request is allowed to proceed.
 *
 * Any requests not matching a `path` in the options, or for which the request origin is not
 * allowed, are blocked with status 403.
 *
 * The logic for detecting which requests should be subject to CSRF protection is also ported from
 * SvelteKit. A request is subject to CSRF protection if:
 * - the request origin does not match the target URL origin (i.e. the app origin)
 * - the method is POST, PUT, PATCH, or DELETE
 * - the content type is application/x-www-form-urlencoded, multipart/form-data, or text/plain
 */
export function handleCsrf(options: OptionsByPath<CsrfOptions>): Handle {
  return async ({ event, resolve }) => {
    const { request, url } = event
    const requestOrigin = request.headers.get('origin')
    const allowedOrigin = getMatchingOptionForURL(url, options)?.origin

    const forbidden =
      isFormContentType(request) &&
      (request.method === 'POST' ||
        request.method === 'PUT' ||
        request.method === 'PATCH' ||
        request.method === 'DELETE') &&
      requestOrigin !== url.origin &&
      allowedOrigin !== true &&
      (requestOrigin == null ||
        allowedOrigin == null ||
        !isOriginAllowed(requestOrigin, allowedOrigin))

    if (forbidden) {
      return httpErrorResponse(
        event.request,
        403,
        `Cross-site ${request.method} form submissions are forbidden`,
      )
    }

    return resolve(event)
  }
}

function isContentType(request: Request, ...types: string[]) {
  const type = request.headers.get('content-type')?.split(';', 1)[0].trim() ?? ''
  return types.includes(type.toLowerCase())
}
function isFormContentType(request: Request) {
  return isContentType(
    request,
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain',
  )
}
