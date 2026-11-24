export function strTrimMid(str: string, o?: { len?: number; midStr?: string }): string {
	const len = o?.len ?? 30
	if (str.length <= len) {
		return str
	}

	const midStr = o?.midStr ?? '...'
	if (len <= midStr.length) {
		return midStr.slice(0, Math.max(0, len))
	}

	const reducedLen = len - midStr.length
	const startLength = Math.ceil(reducedLen * 0.5)
	const endLength = reducedLen - startLength
	// slice(-0) would return the whole string
	const end = endLength > 0 ? str.slice(-endLength) : ''
	return `${str.slice(0, startLength)}${midStr}${end}`
}
