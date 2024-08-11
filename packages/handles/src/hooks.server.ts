import { sequence } from '@sveltejs/kit/hooks'

import { handleCors } from '$lib/hooks/handle-cors.js'
import { handleCsrf } from '$lib/hooks/handle-csrf.js'
import { handleProxies } from '$lib/hooks/handle-proxies.js'

export const handle = sequence(
  handleProxies({ proxies: [{ from: '/proxy', to: 'http://eu.httpbin.org/' }] }),
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
  ]),
  handleCsrf([
    ['/api/csrf-handler/all-origins', true],
    [/\/api\/csrf-handler\/some-origins/, ['http://google.com', /trusted-domain/]],
  ]),
)
