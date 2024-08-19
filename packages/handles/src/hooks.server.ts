import { sequence } from '@sveltejs/kit/hooks'

import { handleCors } from '$lib/hooks/handle-cors.js'
import { handleCsrf } from '$lib/hooks/handle-csrf.js'
import { handleProxies } from '$lib/hooks/handle-proxies.js'

export const handle = sequence(
  handleProxies([['/proxy', { to: 'http://eu.httpbin.org/' }]]),
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
