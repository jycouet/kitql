import { json } from '@sveltejs/kit'

import { CreateCorsWrapper } from '$lib/index.js'

const wrapper = CreateCorsWrapper({
  origin: ['http://google.com', /trusted-domain/],
  methods: ['GET', 'PUT'],
  allowedHeaders: 'X-Allowed-Header',
  exposedHeaders: 'X-Exposed-Header',
  credentials: true,
  maxAge: 42,
})

export const OPTIONS = wrapper(() => new Response(null, { status: 204 }))

export const GET = wrapper(() => json({ message: 'Success message' }))
