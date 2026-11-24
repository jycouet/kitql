// this will be infered in 'vite-plugin-kit-routes'
export const match = (param: string): param is 'a' | 'b' => {
	return ['a', 'b'].includes(param)
}
