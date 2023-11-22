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

  it('get params & id group', async () => {
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

  it('formatKey new type', async () => {
    expect(formatKey('/[param]site/[yop](group)/[id]')).toMatchInlineSnapshot(
      '"param_site_yop_group_id"',
    )
  })

  it('formatKey group original', async () => {
    expect(
      formatKey('/[param]site/[yop](group)/[id]', { keep_path_param_format: true }),
    ).toMatchInlineSnapshot('"/[param]site/[yop](group)/[id]"')
  })

  it('formatKey ROOT', async () => {
    expect(formatKey('/')).toMatchInlineSnapshot('"_ROOT"')
  })

  it('fileToMetadata optional only', async () => {
    const meta = fileToMetadata('/[[lang]]', 'PAGES', undefined, undefined)
    if (meta) {
      expect(meta.prop).toMatchInlineSnapshot(
        `
        "\\"lang\\": (params: {lang?: string | number}= {}) =>  {
            return \`\${params?.lang ? \`/\${params?.lang}\`: '/'}\`
          }"
      `,
      )
    } else {
      expect('I should never be').toBe('here')
    }
  })

  it('fileToMetadata optional', async () => {
    const meta = fileToMetadata('/[[lang]]/about', 'PAGES', undefined, undefined)
    if (meta) {
      expect(meta.prop).toMatchInlineSnapshot(
        `
        "\\"lang_about\\": (params: {lang?: string | number}= {}) =>  {
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/about\`
          }"
      `,
      )
    } else {
      expect('I should never be').toBe('here')
    }
  })

  it('fileToMetadata optional not at start', async () => {
    const meta = fileToMetadata('/prefix-[[lang]]/about', 'PAGES', undefined, undefined)
    if (meta) {
      expect(meta.prop).toMatchInlineSnapshot(
        `
        "\\"prefix_lang_about\\": (params: {lang?: string | number}= {}) =>  {
            return \`/prefix-\${params?.lang ? \`\${params?.lang}\`: ''}/about\`
          }"
      `,
      )
    } else {
      expect('I should never be').toBe('here')
    }
  })

  it('fileToMetadata default param', async () => {
    const meta = fileToMetadata(
      '/subscriptions/[snapshot]/[id]',
      'PAGES',
      {
        extend: {
          PAGES: {
            subscriptions_snapshot_id: {
              explicit_search_params: { limit: { type: 'number' } },
              params: {
                snapshot: { type: 'string', default: 'snapshot' },
                id: { type: 'string', default: 'id' },
              },
            },
          },
        },
      },
      undefined,
    )
    if (meta) {
      expect(meta.prop).toMatchInlineSnapshot(
        `
        "\\"subscriptions_snapshot_id\\": (params: {snapshot?: string, id?: string, limit?: number}= {}) =>  {
            params.snapshot = params.snapshot ?? 'snapshot'; 
            params.id = params.id ?? 'id'; 
            return \`/subscriptions/\${params.snapshot}/\${params.id}\${appendSp({ limit: params.limit })}\`
          }"
      `,
      )
    } else {
      expect('I should never be').toBe('here')
    }
  })
})
