import { describe, expect, it } from 'vitest'

import { getExportsFromFile } from './ast.js'

describe('getExportsFromFile', () => {
	it('should find default export', () => {
		const code = `
			const config = { foo: 'bar' }
			export default config
		`
		const result = getExportsFromFile(code)
		expect(result).toBeDefined()
		expect(result.type).toBe('Identifier')
		expect(result.name).toBe('config')
	})

	it('should find named export', () => {
		const code = `
			const config = { foo: 'bar' }
			export const myConfig = config
		`
		const result = getExportsFromFile(code, 'myConfig')
		expect(result).toBeDefined()
		expect(result.type).toBe('Identifier')
		expect(result.name).toBe('config')
	})

	it('should handle re-exported named exports', () => {
		const code = `
			const config = { foo: 'bar' }
			export { config as myConfig }
		`
		const result = getExportsFromFile(code, 'myConfig')
		expect(result).toBeDefined()
		expect(result).toBe('config')
	})

	it('should return null for non-existent export', () => {
		const code = `
			const config = { foo: 'bar' }
			export default config
		`
		const result = getExportsFromFile(code, 'nonExistent')
		expect(result).toBeNull()
	})

	it('should handle invalid code gracefully', () => {
		const code = 'invalid code'
		const result = getExportsFromFile(code)
		expect(result).toBeNull()
	})
})
