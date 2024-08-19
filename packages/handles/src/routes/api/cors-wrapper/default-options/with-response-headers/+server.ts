import { json } from '@sveltejs/kit'

import { createCorsWrapper } from '$lib/index.js'

const wrapper = createCorsWrapper()

export const OPTIONS = wrapper(
  () =>
    new Response(null, {
      status: 204,
      headers: { 'X-Custom-Header': 'custom options value', 'Access-Control-Max-Age': '42' },
    }),
)

export const GET = wrapper(() =>
  json({ message: 'Success message' }, { headers: { 'X-Custom-Header': 'custom get value' } }),
)
