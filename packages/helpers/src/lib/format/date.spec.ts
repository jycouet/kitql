import { describe, expect, it } from 'vitest'

import { dateISOCompact } from './date.js'

describe('dateCompact', () => {
  it('should format the date correctly', () => {
    const result = dateISOCompact(new Date('2024-02-07').toISOString())
    expect(result).toMatchInlineSnapshot(`"240207_000000"`)
  })

  it('should format the date correctly with hour', () => {
    const result = dateISOCompact(new Date('2024-02-07 13:01:02').toISOString())
    expect(result).toMatchInlineSnapshot(`"240207_130102"`)
  })

  it('should handle ISO correctly', () => {
    const result = dateISOCompact(new Date('2024-02-07T13:01:02Z').toISOString())
    expect(result).toMatchInlineSnapshot(`"240207_130102"`)
  })

  it('should handle timezone differences correctly', () => {
    const result = dateISOCompact(new Date('2024-02-07T13:01:02+04:00').toISOString())
    expect(result).toMatchInlineSnapshot(`"240207_090102"`)
  })
})
