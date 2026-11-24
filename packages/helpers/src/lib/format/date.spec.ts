import { describe, expect, it, vi } from 'vitest'

import { dateCompact } from './date.js'

describe('dateCompact', () => {
	it('should format the date correctly', () => {
		const result = dateCompact(new Date('2024-02-07'))
		expect(result).toMatchInlineSnapshot(`"240207_000000"`)
	})

	it('should format the date correctly with hour', () => {
		const result = dateCompact(new Date('2024-02-07 13:01:02'))
		expect(result).toMatchInlineSnapshot(`"240207_130102"`)
	})

	it('should handle ISO correctly', () => {
		const result = dateCompact(new Date('2024-02-07T13:01:02Z'))
		expect(result).toMatchInlineSnapshot(`"240207_130102"`)
	})

	it('should handle timezone differences correctly', () => {
		const result = dateCompact(new Date('2024-02-07T13:01:02+04:00'))
		expect(result).toMatchInlineSnapshot(`"240207_090102"`)
	})

	it('does not mutate the given date (non-UTC timezone)', () => {
		// tests run under TZ=UTC, fake New York winter offset
		const spy = vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(300)
		const d = new Date('2024-03-05T10:20:30Z')
		expect(dateCompact(d)).toBe('240305_052030')
		expect(dateCompact(d)).toBe('240305_052030')
		expect(d.toISOString()).toBe('2024-03-05T10:20:30.000Z')
		spy.mockRestore()
	})
})
