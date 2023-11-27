import { describe, expect, it } from 'vitest'

import type { KIT_ROUTES as KIT_ROUTES_ObjectPath } from '../test/ROUTES_format-object-path.js'
import type { KIT_ROUTES as KIT_ROUTES_ObjectSymbol } from '../test/ROUTES_format-object-symbol.js'
import type { KIT_ROUTES as KIT_ROUTES_RoutePath } from '../test/ROUTES_format-route-path.js'
import type { KIT_ROUTES as KIT_ROUTES_RouteSymbol } from '../test/ROUTES_format-route-symbol.js'
import type { KIT_ROUTES as KIT_ROUTES_Variables } from '../test/ROUTES_format-variables.js'
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

describe('run()', async () => {
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

  const commonConfig_symbol: Options<KIT_ROUTES_ObjectSymbol> = {
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
      match_id_int: {
        params: {
          id: { type: 'number' },
        },
      },
      site_contract_siteId_contractId: {
        explicit_search_params: { limit: { type: 'number' } },
      },
    },
    SERVERS: {},
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

  const commonConfig_Path: Options<KIT_ROUTES_ObjectPath> = {
    PAGES: {
      '/subGroup2': commonConfig_symbol.PAGES?.subGroup2,
      '/contract': commonConfig_symbol.PAGES?.contract,
      '/site': commonConfig_symbol.PAGES?.site,
      '/site/[id]': commonConfig_symbol.PAGES?.site_id,
      '/match/[id=int]': commonConfig_symbol.PAGES?.match_id_int,
      '/site_contract/[siteId]-[contractId]':
        commonConfig_symbol.PAGES?.site_contract_siteId_contractId,
    },
    SERVERS: {},
    ACTIONS: {
      'default /contract/[id]': commonConfig_symbol.ACTIONS?.default_contract_id,
      'send /site_contract/[siteId]-[contractId]':
        commonConfig_symbol.ACTIONS?.send_site_contract_siteId_contractId,
    },
  }

  const commonConfig_symbol_space: Options<KIT_ROUTES_RouteSymbol> = {
    PAGES: {
      subGroup2: commonConfig_symbol.PAGES?.subGroup2,
      contract: commonConfig_symbol.PAGES?.contract,
      site: commonConfig_symbol.PAGES?.site,
      site_id: commonConfig_symbol.PAGES?.site_id,
      match_id_int: commonConfig_symbol.PAGES?.match_id_int,
      site_contract_siteId_contractId: commonConfig_symbol.PAGES?.site_contract_siteId_contractId,
    },
    SERVERS: {},
    ACTIONS: {
      'default contract_id': commonConfig_symbol.ACTIONS?.default_contract_id,
      'send site_contract_siteId_contractId':
        commonConfig_symbol.ACTIONS?.send_site_contract_siteId_contractId,
    },
  }

  function fnOrNot(obj: any, key: any, ...params: any[]): string {
    if (obj[key] instanceof Function) {
      const element = (obj as any)[key] as (...args: any[]) => string
      return element(...params)
    } else {
      return obj[key] as string
    }
  }
  const table = [
    {
      name: 'ROOT, return is not a function',
      results: '/',
      key_path: '/',
      key_symbol: '_ROOT',
    },
    {
      name: 'single param',
      results: '/fr/site/Paris',
      key_path: '/site/[id]',
      key_symbol: 'site_id',
      params: { id: 'Paris' },
    },
  ]

  //
  // RUN
  //
  // 'object[path]'
  const generated_file_objectPath = 'src/test/ROUTES_format-object-path.ts'
  run(false, {
    format: 'object[path]',
    generated_file_path: generated_file_objectPath,
    ...commonConfig,
    ...commonConfig_Path,
  })

  // 'object[symbol]'
  const generated_file_objectSymbol = 'src/test/ROUTES_format-object-symbol.ts'
  run(false, {
    generated_file_path: generated_file_objectSymbol,
    format: 'object[symbol]',
    ...commonConfig_symbol,
    ...commonConfig,
  })

  // 'route(path)'
  const generated_file_routePath = `src/test/ROUTES_format-route-path.ts`
  run(false, {
    generated_file_path: generated_file_routePath,
    format: 'route(path)',
    ...commonConfig,
    ...commonConfig_Path,
  })

  // 'route(symbol)'
  const generated_file_routeSymbol = 'src/test/ROUTES_format-route-symbol.ts'
  run(false, {
    generated_file_path: generated_file_routeSymbol,
    format: 'route(symbol)',
    ...commonConfig,
    ...commonConfig_symbol_space,
  })

  // 'variables'
  const generated_file_variables = 'src/test/ROUTES_format-variables.ts'
  run(false, {
    generated_file_path: generated_file_variables,
    format: 'variables',
    ...commonConfig_symbol,
    ...commonConfig,
  })

  for (let i = 0; i < table.length; i++) {
    const element = table[i]
    describe(element.name, async () => {
      //
      it('object[path]', async () => {
        let { PAGES } = await import(generated_file_objectPath)
        expect(
          fnOrNot(PAGES, element.key_path, element.params),
          `Name: ${element.name}, i: ${i}`,
        ).toBe(element.results)
      })

      //
      it('object[symbol]', async () => {
        let { PAGES } = await import(generated_file_objectSymbol)
        expect(
          fnOrNot(PAGES, element.key_symbol, element.params),
          `Name: ${element.name}, i: ${i}`,
        ).toBe(element.results)
      })

      //
      it('format route(path)', async () => {
        let { route } = await import(generated_file_routePath)
        expect(route(element.key_path, element.params), `Name: ${element.name}, i: ${i}`).toBe(
          element.results,
        )
      })

      //
      it('format route(symbol)', async () => {
        let { route } = await import(generated_file_routeSymbol)
        expect(route(element.key_symbol, element.params), `Name: ${element.name}, i: ${i}`).toBe(
          element.results,
        )
      })

      //
      it('format variables', async () => {
        let vars = await import(generated_file_variables)
        if (element.results === '/') {
          expect(vars.PAGE__ROOT, `Name: ${element.name}, i: ${i}`).toBe(element.results)
        } else if (element.results === '/fr/site/Paris') {
          expect(vars.PAGE_site_id({ id: 'Paris' }), `Name: ${element.name}, i: ${i}`).toBe(
            element.results,
          )
        }
      })
    })
  }

  it('post_update_run', () => {
    const generated_file_path = 'src/test/ROUTES_post-update.ts'
    run(false, {
      generated_file_path,
      post_update_run: 'echo done',
    })

    expect(true).toBe(true)
  })

  it('with path base', () => {
    const generated_file_path = 'src/test/ROUTES_base.ts'
    run(false, {
      generated_file_path,
      path_base: true,
    })

    expect(read(generated_file_path)?.includes("import { base } from '$app/paths'")).toBe(true)
    expect(read(generated_file_path)?.includes('${base}')).toBe(true)
  })
})
