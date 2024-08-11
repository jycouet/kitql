import { sequence } from '@sveltejs/kit/hooks'

import { handleProxies } from '$lib/hooks/handle-proxies.js'

export const handle = sequence(
  // Proxy requests through kit
  handleProxies({ proxies: [{ from: '/proxy', to: 'http://eu.httpbin.org/' }] }),
)
