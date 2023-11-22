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

  it('formatKey default', async () => {
    expect(formatKey('/[param]site/[yop](group)/[id]')).toMatchInlineSnapshot(
      '"/[param]site/[yop]/[id]"',
    )
  })

  it('formatKey /l', async () => {
    expect(
      formatKey('/[param]site/[yop](group)/[id]', { object_keys_format: '/' }),
    ).toMatchInlineSnapshot('"/[param]site/[yop]/[id]"')
  })

  it('formatKey _', async () => {
    expect(
      formatKey('/[param]site/[yop](group)/[id]', { object_keys_format: '_' }),
    ).toMatchInlineSnapshot('"param_site_yop_id"')
  })

  it('formatKey / starting with group', async () => {
    expect(formatKey('/(group)/test', { object_keys_format: '/' })).toMatchInlineSnapshot('"/test"')
  })

  it('formatKey _ starting with group', async () => {
    expect(formatKey('/(group)/test', { object_keys_format: '_' })).toMatchInlineSnapshot('"test"')
  })

  it('formatKey group original', async () => {
    expect(
      formatKey('/[param]site/[yop](group)/[id]', { object_keys_format: '_' }),
    ).toMatchInlineSnapshot('"param_site_yop_id"')
  })

  it('formatKey ROOT', async () => {
    expect(formatKey('/')).toMatchInlineSnapshot('"/"')
  })

  it('fileToMetadata optional only', async () => {
    const meta = fileToMetadata('/[[lang]]', 'PAGES', undefined, undefined)
    if (meta) {
      expect(meta.prop).toMatchInlineSnapshot(
        `
        "\\"/[[lang]]\\": (params: {lang?: string | number}= {}) =>  {
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
        "\\"/[[lang]]/about\\": (params: {lang?: string | number}= {}) =>  {
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
        "\\"/prefix-[[lang]]/about\\": (params: {lang?: string | number}= {}) =>  {
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
        "\\"/subscriptions/[snapshot]/[id]\\": (params: {snapshot: string | number, id: string | number}) =>  {
                return \`/subscriptions/\${params.snapshot}/\${params.id}\`
              }"
      `,
      )
    } else {
      expect('I should never be').toBe('here')
    }
  })
})
