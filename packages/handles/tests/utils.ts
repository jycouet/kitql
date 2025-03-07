export function assertDefined<T>(value: T | undefined, message?: string): asserts value is T {
	if (value === undefined) {
		throw new Error(message || 'Expected value to be defined')
	}
}
