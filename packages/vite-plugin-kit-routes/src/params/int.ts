import type { ParamMatcher } from '@sveltejs/kit'

const intRegex = /^\d+$/

export const match: ParamMatcher = (param) => {
	return intRegex.test(param)
}
