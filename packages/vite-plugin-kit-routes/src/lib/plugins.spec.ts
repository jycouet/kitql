import { describe, expect, it } from 'vitest'
import { extractParamsFromPath, fileToMetadata, formatKey } from './index.js'

describe('vite-plugin-kit-routes', () => {
  it('get id', async () => {
    expect(extractParamsFromPath('/site/[id]')).toMatchInlineSnapshot(`
      {
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

  it('fileToMetadata optional', async () => {
    expect(
      fileToMetadata('/[[lang]]/about', 'PAGES', undefined, undefined).prop,
    ).toMatchInlineSnapshot(
      '"\\"lang_about\\": (params?: {lang?: string | number}) =>  { return `${params?.lang ? `/${params?.lang}`: \'\'}/about` }"',
    )
  })

  it('fileToMetadata optional not at start', async () => {
    expect(
      fileToMetadata('/prefix-[[lang]]/about', 'PAGES', undefined, undefined).prop,
    ).toMatchInlineSnapshot(
      '"\\"prefix_lang_about\\": (params?: {lang?: string | number}) =>  { return `/prefix-${params?.lang ? `${params?.lang}`: \'\'}/about` }"',
    )
  })
})
