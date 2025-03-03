export const debounce = (fn: (...args: any[]) => void, delay: number = 444) => {
	let timeout: ReturnType<typeof setTimeout>
	return (...args: any[]) => {
		clearTimeout(timeout)
		timeout = setTimeout(() => fn(...args), delay)
	}
}