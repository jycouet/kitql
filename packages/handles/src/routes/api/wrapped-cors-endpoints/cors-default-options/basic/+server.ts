import { json } from '@sveltejs/kit'

import { CreateCorsWrapper } from '$lib/index.js'

const wrapper = CreateCorsWrapper()

export const OPTIONS = wrapper(() => new Response(null, { status: 204 }))

export const GET = wrapper(() => json({ message: 'Success message' }))
