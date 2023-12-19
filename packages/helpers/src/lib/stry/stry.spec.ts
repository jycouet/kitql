import { describe, expect, it } from 'vitest'

import { stry, stry0, stryEq } from './stry.js'

describe('kitql - helper - stry', () => {
  it('space 2', () => {
    const obj = { hello: 'world' }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
      "{
        "hello": "world"
      }"
    `)
  })

  it('space 0', () => {
    const obj = { hello: 'world' }
    const result = stry(obj, 0)
    expect(result).toMatchInlineSnapshot(`"{"hello":"world"}"`)
  })

  it('order a b c', () => {
    const obj = { a: 1, c: 3, b: 2 }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
      "{
        "a": 1,
        "b": 2,
        "c": 3
      }"
    `)
  })

  it('order A a', () => {
    const obj = { A: 'ONE', a: 1 }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
      "{
        "A": "ONE",
        "a": 1
      }"
    `)
  })

  it('order a A', () => {
    const obj = { a: 1, A: 'ONE' }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
      "{
        "A": "ONE",
        "a": 1
      }"
    `)
  })

  it('order a b c with nested', () => {
    const obj = { a: { bb: 22, aa: 11 }, c: 3, b: { aa: 11, bb: 22 } }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
      "{
        "a": {
          "aa": 11,
          "bb": 22
        },
        "b": {
          "aa": 11,
          "bb": 22
        },
        "c": 3
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
        "a": null
      }"
    `)
  })

  it('should handle dates', () => {
    const obj = { myDate: new Date('1986-11-07T06:05:04.000Z') }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
      "{
        "myDate": "1986-11-07T06:05:04.000Z"
      }"
    `)
  })

  it('should handle array', () => {
    const obj = { vals: [4, 2, 3, 10] }
    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
      "{
        "vals": [
          4,
          2,
          3,
          10
        ]
      }"
    `)
  })

  it('should handle array', () => {
    const obj = {
      data: {
        usersList: [
          { name: 'Bruce Willis', id: 'pagination-query-offset-variables:1' },
          { name: 'Samuel Jackson', id: 'pagination-query-offset-variables:2' },
          { name: 'Morgan Freeman', id: 'pagination-query-offset-variables:3' },
          { name: 'Tom Hanks', id: 'pagination-query-offset-variables:4' },
        ],
      },
    }

    const result = stry(obj)
    expect(result).toMatchInlineSnapshot(`
      "{
        "data": {
          "usersList": [
            {
              "id": "pagination-query-offset-variables:1",
              "name": "Bruce Willis"
            },
            {
              "id": "pagination-query-offset-variables:2",
              "name": "Samuel Jackson"
            },
            {
              "id": "pagination-query-offset-variables:3",
              "name": "Morgan Freeman"
            },
            {
              "id": "pagination-query-offset-variables:4",
              "name": "Tom Hanks"
            }
          ]
        }
      }"
    `)
  })
})

describe('kitql - helper - stry0', () => {
  it('stry0', () => {
    const obj = { b: 'coucou', a: 'hello' }
    const result = stry0(obj)
    expect(result).toMatchInlineSnapshot(`"{"a":"hello","b":"coucou"}"`)
  })
})

describe('kitql - helper - stryEq', () => {
  it('stryEq easy', () => {
    const obj1 = { b: 'coucou', a: 'hello' }
    const obj2 = { b: 'coucou', a: 'hello' }
    const result = stryEq(obj1, obj2)
    expect(result).toBe(true)
  })

  it('stryEq different order', () => {
    const obj1 = { b: 'coucou', a: 'hello' }
    const obj2 = { a: 'hello', b: 'coucou' }
    const result = stryEq(obj1, obj2)
    expect(result).toBe(true)
  })

  it('stryEq different values', () => {
    const obj1 = { b: 'yop', a: 'hello' }
    const obj2 = { a: 'hello', b: 'coucou' }
    const result = stryEq(obj1, obj2)
    expect(result).toBe(false)
  })

  it('stryEq undefined & null', () => {
    const obj1 = { b: undefined, a: 'hello' }
    const obj2 = { a: 'hello', b: null }

    const result = stryEq(obj1, obj2)
    expect(result).toBe(false)
  })
})
