import { json } from '@sveltejs/kit'

import { createCorsWrapper } from '$lib/index.js'

const wrapper = createCorsWrapper()

export const OPTIONS = wrapper.OPTIONS

export const GET = wrapper(() => json({ message: 'Success message' }))
