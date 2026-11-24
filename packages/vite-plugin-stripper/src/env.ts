import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({
	AUTH_SECRET: { static: true },
})
