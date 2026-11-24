const intRegex = /^\d+$/

export const match = (param: string): boolean => {
	return intRegex.test(param)
}
