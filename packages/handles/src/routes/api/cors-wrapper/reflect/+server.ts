import { json } from '@sveltejs/kit'

import { createCorsWrapper } from '$lib/index.js'

const wrapper = createCorsWrapper({
	origin: true,
})

export const OPTIONS = wrapper.OPTIONS

export const GET = wrapper(() => json({ message: 'Success message' }))
