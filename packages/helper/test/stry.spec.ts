import { describe, expect, it } from 'vitest'

import { stry } from '../src/stry'

describe('kitql - helper - stry', () => {
  it('space 2', () => {
    const obj = { hello: 'world' }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
			"{
			  \\"hello\\": \\"world\\"
			}"
		`)
  })

  it('space 0', () => {
    const obj = { hello: 'world' }
    const result = stry(obj, 0)
    expect(result).toMatchInlineSnapshot('"{\\"hello\\":\\"world\\"}"')
  })

  it('order a b c', () => {
    const obj = { a: 1, c: 3, b: 2 }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
			"{
			  \\"a\\": 1,
			  \\"b\\": 2,
			  \\"c\\": 3
			}"
		`)
  })

  it('order A a', () => {
    const obj = { A: 'ONE', a: 1 }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
			"{
			  \\"A\\": \\"ONE\\",
			  \\"a\\": 1
			}"
		`)
  })

  it('order a A', () => {
    const obj = { a: 1, A: 'ONE' }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
      "{
        \\"A\\": \\"ONE\\",
        \\"a\\": 1
      }"
    `)
  })

  it('order a b c with nested', () => {
    const obj = { a: { bb: 22, aa: 11 }, c: 3, b: { aa: 11, bb: 22 } }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
			"{
			  \\"a\\": {
			    \\"aa\\": 11,
			    \\"bb\\": 22
			  },
			  \\"b\\": {
			    \\"aa\\": 11,
			    \\"bb\\": 22
			  },
			  \\"c\\": 3
			}"
		`)
  })

  it('obj null', () => {
    const obj = null
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot('null')
  })

  it('obj undefined', () => {
    const obj = undefined
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot('undefined')
  })

  it('obj will null', () => {
    const obj = { a: null }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
			"{
			  \\"a\\": null
			}"
		`)
  })

  it('should handle dates', () => {
    const obj = { myDate: new Date('1986-11-07T06:05:04.000Z') }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
      "{
        \\"myDate\\": \\"1986-11-07T06:05:04.000Z\\"
      }"
    `)
  })
})
