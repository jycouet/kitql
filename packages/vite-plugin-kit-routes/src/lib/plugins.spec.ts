import { describe, expect, it } from 'vitest'
import { extractParamsFromPath, fileToMetadata, formatKey } from './plugin.js'

describe('vite-plugin-kit-routes', () => {
  it('get id', async () => {
    expect(extractParamsFromPath('/site/[id]')).toMatchInlineSnapshot(`
      [
        {
          "name": "id",
          "optional": false,
        },
      ]
    `)
  })

  it('get params & id', async () => {
    expect(extractParamsFromPath('/site/[param]/[id]')).toMatchInlineSnapshot(`
      [
        {
          "name": "param",
          "optional": false,
        },
        {
          "name": "id",
          "optional": false,
        },
      ]
    `)
  })

  it('get params & id', async () => {
    expect(extractParamsFromPath('/[param]site/[yop](group)/[id]')).toMatchInlineSnapshot(`
      [
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
      ]
    `)
  })

  it('get optional param', async () => {
    expect(extractParamsFromPath('/lang/[[lang]]')).toMatchInlineSnapshot(`
      [
        {
          "name": "lang",
          "optional": true,
        },
      ]
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
      '"\\"lang_about\\": (params: {lang?: string | number}= {}) =>  { return `${params?.lang ? `/${params?.lang}`: \'\'}/about` }"',
    )
  })

  it('fileToMetadata optional not at start', async () => {
    expect(
      fileToMetadata('/prefix-[[lang]]/about', 'PAGES', undefined, undefined).prop,
    ).toMatchInlineSnapshot(
      '"\\"prefix_lang_about\\": (params: {lang?: string | number}= {}) =>  { return `/prefix-${params?.lang ? `${params?.lang}`: \'\'}/about` }"',
    )
  })

  it('fileToMetadata default param', async () => {
    expect(
      fileToMetadata(
        '/subscriptions/[snapshot]/[id]',
        'PAGES',
        {
          extend: {
            PAGES: {
              subscriptions_snapshot_id: {
                explicit_search_params: { limit: { type: 'number' } },
                params: {
                  snapshot: { type: 'string', default: 'coucou' },
                  id: { type: 'string', default: 'coucou' },
                },
              },
            },
          },
        },
        undefined,
      ).prop,
    ).toMatchInlineSnapshot(
      '"\\"subscriptions_snapshot_id\\": (params: {snapshot?: string, id?: string, limit?: number}= {}) =>  { params.snapshot = params.snapshot ?? \'coucou\'; params.id = params.id ?? \'coucou\'; return `/subscriptions/[snapshot]/[id]${appendSp({ limit: params.limit })}` }"',
    )
  })
})
