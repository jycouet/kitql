import { describe, expect, it } from 'vitest'

import { strTrimMid } from './str.js'

describe('kitql - helper - str', () => {
  it('midTrim nothing to trim', () => {
    expect(strTrimMid('Hello, world!')).toBe('Hello, world!')
  })

  it('midTrim trim with exact length', () => {
    const result = strTrimMid('Hello, world! This is a long string', { len: 10 })
    expect(result.length).toBe(10)
    expect(result).toBe('Hell...ing')
  })

  it('midTrim prioritizes start of string', () => {
    const result = strTrimMid('Beginning Middle End of String', { len: 15 })
    expect(result.length).toBe(15)
    expect(result).toBe('Beginn...String')
  })

  it('midTrim with custom midStr **', () => {
    const result = strTrimMid('Hello, world! This is a test', { len: 12, midStr: '**' })
    expect(result.length).toBe(12)
    expect(result).toBe('Hello** test')
  })

  it('midTrim with custom midStr " "', () => {
    const result = strTrimMid('Hello, world! This is a test', { len: 12, midStr: ' ' })
    expect(result.length).toBe(12)
    expect(result).toBe('Hello,  test')
  })

  it('behave with long string and default options', () => {
    const result = strTrimMid('Hello, world! This is a test Hello, world! This is a test')
    expect(result.length).toBe(30)
    expect(result).toBe('Hello, world! ...his is a test')
  })

  it('behave with long string and space split option', () => {
    const result = strTrimMid('Hello, world! This is a test Hello, world! This is a test', {
      midStr: ' ',
    })
    expect(result.length).toBe(30)
    expect(result).toBe('Hello, world! T This is a test')
  })

  it('should not trim outside of the string', () => {
    const result = strTrimMid('  Plop  ')
    expect(result).toBe('  Plop  ')
  })
})
