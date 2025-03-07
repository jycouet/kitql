import type { ParamMatcher } from '@sveltejs/kit'

// this will be infered in 'vite-plugin-kit-routes'
export const match = ((param): param is 'a' | 'b' => {
	return ['a', 'b'].includes(param)
}) satisfies ParamMatcher
