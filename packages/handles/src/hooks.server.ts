import { error, redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import { handleCors } from '$lib/hooks/handle-cors.js'
import { handleCsrf } from '$lib/hooks/handle-csrf.js'
import { handleProxies } from '$lib/hooks/handle-proxies.js'

const addTestDataToLocals: Handle = async ({ event, resolve }) => {
  event.locals.testData = 'test-locals-data'
  return resolve(event)
}

export const handle = sequence(
  addTestDataToLocals,
  handleProxies([
    ['/proxy/', { to: 'http://eu.httpbin.org/' }],
    [
      '/proxy-advanced/',
      {
        to: 'http://eu.httpbin.org/',
        requestHook: (event) => {
          if (event.url.pathname.includes('test-redirect')) {
            redirect(302, 'https://kitql.dev/')
          }
          if (event.url.pathname.includes('test-error')) {
            error(418, { message: 'Custom teapot-related error message', isTeapot: true })
          }
          if (event.url.pathname.includes('test-rewrite-path-same-prefix')) {
            const request = event.request.clone()
            const url = new URL(request.url)
            url.pathname = '/proxy-advanced/status/208'
            return new Request(url.toString(), request)
          }
          if (event.url.pathname.includes('test-rewrite-path-no-matching-prefix')) {
            const request = event.request.clone()
            const url = new URL(request.url)
            url.pathname = '/api/cors-handler/default-options/with-response-headers'
            return new Request(url.toString(), request)
          }
          if (event.url.pathname.includes('test-using-locals')) {
            const request = event.request.clone()
            const url = new URL(request.url)
            url.pathname = '/proxy-advanced/get'
            url.search = `?test_data=${event.locals.testData}`
            return new Request(url.toString(), request)
          }
          if (event.url.pathname.includes('test-manipulating-headers')) {
            const request = event.request.clone()
            const url = new URL(request.url)
            url.pathname = '/proxy-advanced/get'
            request.headers.delete('Authorization')
            request.headers.set('X-Api-Key', 'sample-api-key')
            return new Request(url.toString(), request)
          }
          return event.request
        },
      },
    ],
  ]),
  handleCors([
    ['/api/cors-handler/default-options', {}],
    [/\/api\/cors-handler\/reflect/, { origin: true }],
    [
      '/api/cors-handler/complex-options',
      {
        origin: ['http://google.com', /trusted-domain/],
        methods: ['GET', 'PUT'],
        allowedHeaders: 'X-Allowed-Header',
        exposedHeaders: 'X-Exposed-Header',
        credentials: true,
        maxAge: 42,
      },
    ],
    [
      '/api/cors-handler/edge-cases',
      {
        // explicitly disable the `Access-Control-Allow-Origin` header
        origin: undefined,
        // explicitly disable the `Access-Control-Allow-Methods` header
        methods: undefined,
        // explicitly disable the `Access-Control-Allow-Headers` header
        allowedHeaders: undefined,
        // set `Access-Control-Allow-Credentials` header to 'true'
        credentials: true,
        optionsStatusSuccess: 200,
      },
    ],
  ]),
  handleCsrf([
    ['/api/csrf-handler/all-origins', { origin: true }],
    [/\/api\/csrf-handler\/some-origins/, { origin: ['http://google.com', /trusted-domain/] }],
    ['/api/csrf-handler/false-origin', { origin: false }],
  ]),
)
