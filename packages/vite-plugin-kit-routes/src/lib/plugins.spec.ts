import { describe, expect, it } from 'vitest'

import { read } from './fs.js'
import {
  extractParamsFromPath,
  transformToMetadata,
  formatKey,
  run,
  type Options,
} from './plugin.js'

describe('vite-plugin-kit-routes', () => {
  it('get id', async () => {
    expect(extractParamsFromPath('/site/[id]')).toMatchInlineSnapshot(`
      [
        {
          "fromPath": true,
          "isArray": false,
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
          "fromPath": true,
          "isArray": false,
          "name": "param",
          "optional": false,
        },
        {
          "fromPath": true,
          "isArray": false,
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
          "fromPath": true,
          "isArray": false,
          "name": "param",
          "optional": false,
        },
        {
          "fromPath": true,
          "isArray": false,
          "name": "yop",
          "optional": false,
        },
        {
          "fromPath": true,
          "isArray": false,
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
          "fromPath": true,
          "isArray": false,
          "name": "lang",
          "optional": true,
        },
      ]
    `)
  })

  it('formatKey default', async () => {
    expect(formatKey('/[param]site/[yop](group)/[id]', {})).toMatchInlineSnapshot(
      '"/[param]site/[yop]/[id]"',
    )
  })

  it('formatKey /l', async () => {
    expect(
      formatKey('/[param]site/[yop](group)/[id]', { format: 'object[path]' }),
    ).toMatchInlineSnapshot('"/[param]site/[yop]/[id]"')
  })

  it('formatKey _', async () => {
    expect(
      formatKey('/[param]site/[yop](group)/[id]', { format: 'object[symbol]' }),
    ).toMatchInlineSnapshot('"param_site_yop_id"')
  })

  it('formatKey / starting with group', async () => {
    expect(formatKey('/(group)/test', { format: 'object[path]' })).toMatchInlineSnapshot('"/test"')
  })

  it('formatKey _ starting with group', async () => {
    expect(formatKey('/(group)/test', { format: 'object[symbol]' })).toMatchInlineSnapshot('"test"')
  })

  it('formatKey group original', async () => {
    expect(
      formatKey('/[param]site/[yop](group)/[id]', { format: 'object[symbol]' }),
    ).toMatchInlineSnapshot('"param_site_yop_id"')
  })

  it('formatKey ROOT', async () => {
    expect(formatKey('/', { format: 'object[path]' })).toMatchInlineSnapshot('"/"')
  })

  it('fileToMetadata optional only', async () => {
    const key = '/[[lang]]'
    const meta = transformToMetadata(key, key, 'PAGES', {}, undefined)
    if (meta) {
      expect(meta).toMatchInlineSnapshot(`
        [
          {
            "keyToUse": "/",
            "key_wo_prefix": "/",
            "paramsFromPath": [
              {
                "fromPath": true,
                "isArray": false,
                "name": "lang",
                "optional": true,
              },
            ],
            "strDefault": "",
            "strParams": "params?: { lang?: (string | number) }",
            "strReturn": "\`\${params?.lang ? \`/\${params?.lang}\`: '/'}\`",
          },
        ]
      `)
    } else {
      expect('I should never be').toBe('here')
    }
  })

  it('fileToMetadata optional', async () => {
    const key = '/[[lang]]/about'
    const meta = transformToMetadata(key, key, 'PAGES', {}, undefined)
    if (meta) {
      expect(meta).toMatchInlineSnapshot(`
        [
          {
            "keyToUse": "/about",
            "key_wo_prefix": "/about",
            "paramsFromPath": [
              {
                "fromPath": true,
                "isArray": false,
                "name": "lang",
                "optional": true,
              },
            ],
            "strDefault": "",
            "strParams": "params?: { lang?: (string | number) }",
            "strReturn": "\`\${params?.lang ? \`/\${params?.lang}\`: ''}/about\`",
          },
        ]
      `)
    } else {
      expect('I should never be').toBe('here')
    }
  })

  it('fileToMetadata optional not at start', async () => {
    const key = '/prefix-[[lang]]/about'
    const meta = transformToMetadata(key, key, 'PAGES', {}, undefined)
    if (meta) {
      expect(meta).toMatchInlineSnapshot(`
        [
          {
            "keyToUse": "/prefix-/about",
            "key_wo_prefix": "/prefix-/about",
            "paramsFromPath": [
              {
                "fromPath": true,
                "isArray": false,
                "name": "lang",
                "optional": true,
              },
            ],
            "strDefault": "",
            "strParams": "params?: { lang?: (string | number) }",
            "strReturn": "\`/prefix-\${params?.lang ? \`\${params?.lang}\`: ''}/about\`",
          },
        ]
      `)
    } else {
      expect('I should never be').toBe('here')
    }
  })

  it('fileToMetadata default param', async () => {
    const key = '/subscriptions/[snapshot]/[id]'
    const meta = transformToMetadata(
      key,
      key,
      'PAGES',
      {
        PAGES: {
          subscriptions_snapshot_id: {
            explicit_search_params: { limit: { type: 'number' } },
            params: {
              snapshot: { type: 'string', default: '"snapshot"' },
              id: { type: 'string', default: '"id"' },
            },
          },
        },
      },
      undefined,
    )
    if (meta) {
      expect(meta).toMatchInlineSnapshot(`
        [
          {
            "keyToUse": "/subscriptions/[snapshot]/[id]",
            "key_wo_prefix": "/subscriptions/[snapshot]/[id]",
            "paramsFromPath": [
              {
                "fromPath": true,
                "isArray": false,
                "name": "snapshot",
                "optional": false,
              },
              {
                "fromPath": true,
                "isArray": false,
                "name": "id",
                "optional": false,
              },
            ],
            "strDefault": "",
            "strParams": "params: { snapshot: (string | number), id: (string | number) }",
            "strReturn": "\`/subscriptions/\${params.snapshot}/\${params.id}\`",
          },
        ]
      `)
    } else {
      expect('I should never be').toBe('here')
    }
  })
})

describe('run()', () => {
  const commonConfig: Options = {
    LINKS: {
      // reference to a hardcoded link
      twitter: 'https://twitter.com/jycouet',

      // reference to link with params!
      twitter_post: 'https://twitter.com/[name]/status/[id]',

      // reference to link with params & search params!
      gravatar: {
        href: 'https://www.gravatar.com/avatar/[str]',
        explicit_search_params: {
          s: { type: 'number', default: 75 },
          d: { type: '"retro" | "identicon"', default: '"identicon"' },
        },
      },
    },
    override_params: {
      lang: { type: "'fr' | 'en' | 'hu' | 'at' | string" },
    },
  }

  const commonConfigFormat_underscore: Options = {
    PAGES: {
      subGroup2: {
        explicit_search_params: {
          first: {
            required: true,
          },
        },
      },
      contract: {
        extra_search_params: 'with',
      },
      site: {
        explicit_search_params: { limit: { type: 'number' } },
        params: {
          // yop: { type: 'number' },
        },
        extra_search_params: 'with',
      },
      site_id: {
        explicit_search_params: { limit: { type: 'number' }, demo: { type: 'string' } },
        params: {
          id: { type: 'string', default: '"Vienna"' },
          lang: { type: "'fr' | 'hu' | undefined", default: '"fr"' },
        },
      },
      site_contract_siteId_contractId: {
        explicit_search_params: { limit: { type: 'number' } },
      },
    },
    SERVERS: {
      // site: {
      //   params: { }
      // }
      // yop: {},
    },
    ACTIONS: {
      default_contract_id: {
        explicit_search_params: {
          limit: { type: 'number' },
        },
      },
      send_site_contract_siteId_contractId: {
        explicit_search_params: {
          extra: { type: "'A' | 'B'", default: '"A"' },
        },
      },
    },
  }

  const commonConfigFormat_underscore_space: Options = {
    ...commonConfigFormat_underscore,
    ACTIONS: {
      'default contract_id': {
        explicit_search_params: {
          limit: { type: 'number' },
        },
      },
      'send site_contract_siteId_contractId': {
        explicit_search_params: {
          extra: { type: "'A' | 'B'", default: '"A"' },
        },
      },
    },
  }

  it('format object[path]', async () => {
    const generated_file_path = 'src/test/ROUTES_format-object-path.ts'
    run({
      format: 'object[path]',
      generated_file_path,
      ...commonConfig,
    })

    let { PAGES } = await import(generated_file_path)
    expect(PAGES['/site/[id]']({ id: 'Paris' })).toMatchInlineSnapshot('"/site/Paris"')
  })

  it('format object[symbol]', async () => {
    const generated_file_path = 'src/test/ROUTES_format-object-symbol.ts'
    run({
      generated_file_path,
      format: 'object[symbol]',
      ...commonConfigFormat_underscore,
      ...commonConfig,
    })

    let { PAGES } = await import(generated_file_path)
    expect(PAGES['site_id']({ id: 'Paris' })).toMatchInlineSnapshot('"/fr/site/Paris"')
  })

  it('format route(path)', async () => {
    const generated_file_path = `src/test/ROUTES_format-route-path.ts`
    run({
      generated_file_path,
      format: 'route(path)',
      ...commonConfig,
    })
    let { route } = await import(generated_file_path)
    // TODO ISSUE HERE
    expect(route('/site/[id]', { id: 'Paris' })).toMatchInlineSnapshot('"/site/Paris"')
  })

  it('format route(symbol)', async () => {
    const generated_file_path = 'src/test/ROUTES_format-route-symbol.ts'
    run({
      generated_file_path,
      format: 'route(symbol)',
      ...commonConfigFormat_underscore_space,
      ...commonConfig,
    })

    let { route } = await import(generated_file_path)
    expect(route('site_id', { id: 'Paris' })).toMatchInlineSnapshot('"/fr/site/Paris"')
  })

  it('format variables', async () => {
    const generated_file_path = 'src/test/ROUTES_format-variables.ts'
    run({
      generated_file_path,
      format: 'variables',
      ...commonConfigFormat_underscore,
      ...commonConfig,
    })

    let { PAGE_site_id } = await import(generated_file_path)
    expect(PAGE_site_id({ id: 'Paris' })).toMatchInlineSnapshot('"/fr/site/Paris"')
  })

  it('post_update_run', () => {
    const generated_file_path = 'src/test/ROUTES_post-update.ts'
    run({
      generated_file_path,
      post_update_run: 'echo done',
    })

    expect(true).toBe(true)
  })

  it('with path base', () => {
    const generated_file_path = 'src/test/ROUTES_base.ts'
    run({
      generated_file_path,
      path_base: true,
      ...commonConfigFormat_underscore,
      ...commonConfig,
    })

    expect(read(generated_file_path)?.includes("import { base } from '$app/paths'")).toBe(true)
    expect(read(generated_file_path)?.includes('${base}')).toBe(true)
  })
})
