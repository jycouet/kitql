export function strTrimMid(str: string, o?: { len?: number; midStr?: string }): string {
	const len = o?.len || 30
	if (str.length > len) {
		const midStr = o?.midStr || '...'
		const reducedLen = len - midStr.length
		const startLength = Math.ceil(reducedLen * 0.5)
		const endLength = reducedLen - startLength
		const start = str.slice(0, startLength)
		const end = str.slice(-endLength)
		return `${start}${midStr}${end}`
	}

	return str
}
