import type { ParamMatcher } from '@sveltejs/kit'

// this will be infered in 'vite-plugin-kit-routes' but produce a type error here...
// That's why I put "// @ts-expect-error" to avoid the type error
// I have a route where in vite config I set number. like this it's overwritten.
// and another route taking this param and infering number.
// @ts-expect-error
export const match = ((param): param is number => {
	return /^\d+$/.test(param)
}) satisfies ParamMatcher
