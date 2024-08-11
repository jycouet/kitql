import { sequence } from '@sveltejs/kit/hooks'

import { handleCors } from '$lib/hooks/handle-cors.js'
import { handleProxies } from '$lib/hooks/handle-proxies.js'

export const handle = sequence(
  handleProxies({ proxies: [{ from: '/proxy', to: 'http://eu.httpbin.org/' }] }),
  handleCors([
    ['/api/cors-default-options', {}],
    [/\/api\/cors-reflect/, { origin: true }],
    [
      '/api/cors-complex-options',
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
)
