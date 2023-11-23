import { describe, expect, it } from 'vitest'

import { transformWarningThrow } from './transformWarningThrow.js'

describe('warning on throw is not a class', () => {
  it('should not warn', async () => {
    const code = `import type { RequestHandler } from './$types'

    export const GET: RequestHandler = async () => {
      throw new Error('Not implemented')
      return new Response()
    }`

    const transformed = await transformWarningThrow('myfile', code, true)

    expect(transformed).toMatchInlineSnapshot(`
      {
        "list": [],
      }
    `)
  })

  it('should warn', async () => {
    const code = `import type { RequestHandler } from './$types'

    export const GET: RequestHandler = async () => {
      throw 7
      return new Response()
    }
    `

    const transformed = await transformWarningThrow('myfile', code, true)

    expect(transformed).toMatchInlineSnapshot(`
      {
        "list": [
          {
            "line": 4,
            "pathFile": "myfile",
          },
        ],
      }
    `)
  })
})
