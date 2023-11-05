import { describe, expect, it } from 'vitest'
import { extractParamsFromPath, formatKey } from './index.js'

describe('vite-plugin-kit-routes', () => {
  it('get id', async () => {
    expect(extractParamsFromPath('/site/[id]')).toMatchInlineSnapshot(`
      {
        "formatArgs": [
          "id: string",
        ],
        "isAllOptional": false,
        "params": [
          {
            "name": "id",
            "optional": false,
          },
        ],
      }
    `)
  })

  it('get params & id', async () => {
    expect(extractParamsFromPath('/site/[param]/[id]')).toMatchInlineSnapshot(`
      {
        "formatArgs": [
          "param: string",
          "id: string",
        ],
        "isAllOptional": false,
        "params": [
          {
            "name": "param",
            "optional": false,
          },
          {
            "name": "id",
            "optional": false,
          },
        ],
      }
    `)
  })

  it('get params & id', async () => {
    expect(extractParamsFromPath('/[param]site/[yop](group)/[id]')).toMatchInlineSnapshot(`
      {
        "formatArgs": [
          "param: string",
          "yop: string",
          "id: string",
        ],
        "isAllOptional": false,
        "params": [
          {
            "name": "param",
            "optional": false,
          },
          {
            "name": "yop",
            "optional": false,
          },
          {
            "name": "id",
            "optional": false,
          },
        ],
      }
    `)
  })

  it('get optional param', async () => {
    expect(extractParamsFromPath('/lang/[[lang]]')).toMatchInlineSnapshot(`
      {
        "formatArgs": [
          "lang?: string",
        ],
        "isAllOptional": true,
        "params": [
          {
            "name": "lang",
            "optional": true,
          },
        ],
      }
    `)
  })

  it('formatKey', async () => {
    expect(formatKey('/[param]site/[yop](group)/[id]')).toMatchInlineSnapshot(
      '"param_site_yop_group_id"',
    )
  })

  it('formatKey', async () => {
    expect(
      formatKey('/[param]site/[yop](group)/[id]', { keep_path_param_format: true }),
    ).toMatchInlineSnapshot('"/[param]site/[yop](group)/[id]"')
  })

  it('formatKey', async () => {
    expect(formatKey('/')).toMatchInlineSnapshot('"_ROOT"')
  })
})
