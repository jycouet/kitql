/** @type {import('@sveltejs/kit').ParamMatcher} */
export const match = (param) => {
	return /^\d+$/.test(param)
}
// this will NOT be infered in 'vite-plugin-kit-routes' it will fallback as string
// maybe you can use a ts file here (check .int.ts)!
// or you can overwrite the type in the vite config