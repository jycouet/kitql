import { json } from '@sveltejs/kit'

import { createCorsWrapper } from '$lib/index.js'

const wrapper = createCorsWrapper({
  // explicitly disable the `Access-Control-Allow-Origin` header
  origin: undefined,
  // explicitly disable the `Access-Control-Allow-Methods` header
  methods: undefined,
  // explicitly disable the `Access-Control-Allow-Headers` header
  allowedHeaders: undefined,
  // set `Access-Control-Allow-Credentials` header to 'true'
  credentials: true,
  optionsStatusSuccess: 200,
})

export const OPTIONS = wrapper.OPTIONS

export const GET = wrapper(() => json({ message: 'Success message' }))
