import { json } from '@sveltejs/kit'

import { createCorsWrapper } from '$lib/index.js'

const wrapper = createCorsWrapper({
  origin: ['http://google.com', /trusted-domain/],
  methods: ['GET', 'PUT'],
  allowedHeaders: 'X-Allowed-Header',
  exposedHeaders: 'X-Exposed-Header',
  credentials: true,
  maxAge: 42,
})

export const OPTIONS = wrapper.OPTIONS

export const GET = wrapper(() => json({ message: 'Success message' }))
