import { describe, expect, it } from 'vitest'
import { extractParamsFromPath } from './index.js'

describe('vite-plugin-kit-routes', () => {
  it('get id', async () => {
    expect(extractParamsFromPath('/site/[id]')).toMatchInlineSnapshot(`
      [
        "id",
      ]
    `)
  })

  it('get params & id', async () => {
    expect(extractParamsFromPath('/site/[param]/[id]')).toMatchInlineSnapshot(`
      [
        "param",
        "id",
      ]
    `)
  })

  it('get params & id', async () => {
    expect(extractParamsFromPath('/[param]site/[yop](group)/[id]')).toMatchInlineSnapshot(`
      [
        "param",
        "yop",
        "id",
      ]
    `)
  })
})
