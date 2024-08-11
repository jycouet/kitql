import type { Handle } from '@sveltejs/kit'

import { isOriginAllowed, type StaticOrigin } from '$lib/utils/origins.js'

import { httpErrorResponse } from './hook-error.js'

type CsrfOptions = Array<[string | RegExp, StaticOrigin]>

/**
 * CSRF protection copied from sveltekit but with the ability to turn it off for specific routes.
 * Logic duplicated from `src/runtime/respond#respond` as of commit
 * `008056b6ef33b554f8b03131c2635cc14b677ff1`
 * https://github.com/sveltejs/kit/blob/008056b6ef33b554f8b03131c2635cc14b677ff1/packages/kit/src/runtime/server/respond.js
 */
export function handleCsrf(options: CsrfOptions): Handle {
  return async ({ event, resolve }) => {
    const { request, url } = event
    const requestOrigin = request.headers.get('origin')
    const matchingCsrfOptions = options.find(([path]) =>
      typeof path === 'string' ? url.pathname.startsWith(path) : path.test(url.pathname),
    )
    const csrfOptions = matchingCsrfOptions?.[1]

    const forbidden =
      isFormContentType(request) &&
      (request.method === 'POST' ||
        request.method === 'PUT' ||
        request.method === 'PATCH' ||
        request.method === 'DELETE') &&
      requestOrigin !== url.origin &&
      csrfOptions !== true &&
      (requestOrigin == null || csrfOptions == null || !isOriginAllowed(requestOrigin, csrfOptions))

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
