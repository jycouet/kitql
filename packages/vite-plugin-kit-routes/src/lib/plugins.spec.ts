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
  type KindOfObject,
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

  const getPathROUTES = (f: string) => {
    return `src/test/ROUTES_${f}.ts`
  }
  const getToRunShortened = (info: any) => {
    return {
      ...info,
      pathFile: `${info.pathFile}_shortened`,
      extra: { ...info.extra, format_short: true },
    }
  }

  const runs = [
    {
      pathFile: 'format-object-path',
      format: 'object[path]',
      extra: { ...commonConfig, ...commonConfig_Path },
    },
    {
      pathFile: 'format-object-symbol',
      format: 'object[symbol]',
      extra: { ...commonConfig, ...commonConfig_symbol },
    },
    {
      pathFile: 'format-route-path',
      format: 'route(path)',
      extra: { ...commonConfig, ...commonConfig_Path },
    },
    {
      pathFile: 'format-route-symbol',
      format: 'route(symbol)',
      extra: { ...commonConfig, ...commonConfig_symbol_space },
    },
    {
      pathFile: 'format-format-variables',
      format: 'variables',
      extra: { ...commonConfig, ...commonConfig_symbol },
    },
  ] as const

  // First time
  for (let i = 0; i < runs.length; i++) {
    const toRun = runs[i]
    it(`run ${toRun.pathFile}`, async () => {
      const ret = run(false, {
        format: toRun.format,
        generated_file_path: getPathROUTES(toRun.pathFile),
        ...toRun.extra,
      })

      expect(ret).toBe(true)
    })
  }
  // Second time shortened
  for (let i = 0; i < runs.length; i++) {
    const toRun = getToRunShortened(runs[i])

    it(`run ${toRun.pathFile}`, async () => {
      const ret = run(false, {
        format: toRun.format,
        generated_file_path: getPathROUTES(toRun.pathFile),
        ...toRun.extra,
      })

      expect(ret).toBe(true)
    })
  }

  function findObj(kind: KindOfObject, PAGES: any, SERVERS: any, ACTIONS: any, LINKS: any) {
    return kind === 'PAGES'
      ? PAGES
      : kind === 'SERVERS'
        ? SERVERS
        : kind === 'ACTIONS'
          ? ACTIONS
          : kind === 'LINKS'
            ? LINKS
            : undefined
  }

  function fnOrNot(obj: any, key: any, ...params: any[]): string {
    if (obj[key] instanceof Function) {
      const element = (obj as any)[key] as (...args: any[]) => string
      return element(...params)
    } else {
      return obj[key] as string
    }
  }

  // Here is the list of tests... to run :)
  const table: {
    name: string
    kind: KindOfObject
    results: string
    key_path: string
    key_symbol: string
    params: any[]
    params_shortened: any[]
  }[] = [
    {
      name: 'ROOT, return is not a function',
      kind: 'PAGES',
      results: '/',
      key_path: '/',
      key_symbol: '_ROOT',
      params: [],
      params_shortened: [],
    },
    {
      name: 'single param (required)',
      kind: 'PAGES',
      results: '/contract/abc',
      key_path: '/contract/[id]',
      key_symbol: 'contract_id',
      params: [{ id: 'abc' }],
      params_shortened: ['abc'],
    },
    {
      name: 'single param (with default)',
      kind: 'PAGES',
      results: '/fr/site/Paris',
      key_path: '/site/[id]',
      key_symbol: 'site_id',
      params: [{ id: 'Paris' }],
      params_shortened: [{ id: 'Paris' }],
    },
    {
      name: 'only optional',
      kind: 'PAGES',
      results: '/main',
      key_path: '/main',
      key_symbol: 'main',
      params: [],
      params_shortened: [],
    },
    {
      name: 'with search params',
      kind: 'PAGES',
      results: '/contract?yop=hello',
      key_path: '/contract',
      key_symbol: 'contract',
      params: [{}, { yop: 'hello' }],
      params_shortened: [{}, { yop: 'hello' }],
    },
    {
      name: 'multi params',
      kind: 'PAGES',
      results: '/fr/site_contract/Paris-abc?limit=2',
      key_path: '/site_contract/[siteId]-[contractId]',
      key_symbol: 'site_contract_siteId_contractId',
      params: [{ siteId: 'Paris', contractId: 'abc', limit: 2, lang: 'fr' }],
      params_shortened: [{ siteId: 'Paris', contractId: 'abc', limit: 2, lang: 'fr' }],
    },
    {
      name: 'direct link',
      kind: 'LINKS',
      results: 'https://twitter.com/jycouet',
      key_path: 'twitter',
      key_symbol: 'twitter',
      params: [],
      params_shortened: [],
    },
  ]

  let nbVariablesDone = 0
  let nbVariablesShortenedDone = 0
  for (let i = 0; i < table.length; i++) {
    const element = table[i]
    describe(element.name, async () => {
      //
      it('format object[path]', async () => {
        let { PAGES, SERVERS, ACTIONS, LINKS } = await import(getPathROUTES(runs[0].pathFile))
        const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)
        expect(fnOrNot(obj, element.key_path, ...element.params), element.name).toBe(
          element.results,
        )
      })
      // SHORTENED
      it('format object[path] shortened', async () => {
        let { PAGES, SERVERS, ACTIONS, LINKS } = await import(
          getPathROUTES(getToRunShortened(runs[0]).pathFile)
        )
        const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)
        expect(fnOrNot(obj, element.key_path, ...element.params_shortened), element.name).toBe(
          element.results,
        )
      })

      //
      it('format object[symbol]', async () => {
        let { PAGES, SERVERS, ACTIONS, LINKS } = await import(getPathROUTES(runs[1].pathFile))
        const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)
        expect(fnOrNot(obj, element.key_symbol, ...element.params), element.name).toBe(
          element.results,
        )
      })
      // SHORTENED
      it('format object[symbol] shortened', async () => {
        let { PAGES, SERVERS, ACTIONS, LINKS } = await import(
          getPathROUTES(getToRunShortened(runs[1]).pathFile)
        )
        const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)
        expect(fnOrNot(obj, element.key_symbol, ...element.params_shortened), element.name).toBe(
          element.results,
        )
      })

      //
      it('format route(path)', async () => {
        let { route } = await import(getPathROUTES(runs[2].pathFile))
        expect(route(element.key_path, ...element.params), element.name).toBe(element.results)
      })
      // SHORTENED
      it('format route(path) shortened', async () => {
        let { route } = await import(getPathROUTES(getToRunShortened(runs[2]).pathFile))
        expect(route(element.key_path, ...element.params_shortened), element.name).toBe(
          element.results,
        )
      })

      //
      it('format route(symbol)', async () => {
        let { route } = await import(getPathROUTES(runs[3].pathFile))
        expect(route(element.key_symbol, ...element.params), element.name).toBe(element.results)
      })
      // SHORTENED
      it('format route(symbol) shortened', async () => {
        let { route } = await import(getPathROUTES(getToRunShortened(runs[3]).pathFile))
        expect(route(element.key_symbol, ...element.params_shortened), element.name).toBe(
          element.results,
        )
      })

      //
      it('format variables', async () => {
        let vars = await import(getPathROUTES(runs[4].pathFile))
        if (element.results === '/') {
          nbVariablesDone++
          expect(vars.PAGE__ROOT, element.name).toBe(element.results)
        } else if (element.results === '/contract/abc') {
          nbVariablesDone++
          expect(vars.PAGE_contract_id({ id: 'abc' }), element.name).toBe(element.results)
        } else if (element.results === '/fr/site/Paris') {
          nbVariablesDone++
          expect(vars.PAGE_site_id({ id: 'Paris' }), element.name).toBe(element.results)
        } else if (element.results === '/main') {
          nbVariablesDone++
          expect(vars.PAGE_main(), element.name).toBe(element.results)
        } else if (element.results === '/contract?yop=hello') {
          nbVariablesDone++
          expect(vars.PAGE_contract({}, { yop: 'hello' }), element.name).toBe(element.results)
        } else if (element.results === 'https://twitter.com/jycouet') {
          nbVariablesDone++
          expect(vars.LINK_twitter, element.name).toBe(element.results)
        } else if (element.results === '/fr/site_contract/Paris-abc?limit=2') {
          nbVariablesDone++
          expect(vars.PAGE_site_contract_siteId_contractId(...element.params), element.name).toBe(
            element.results,
          )
        }
      })
      // SHORTENED
      it('format variables shortened', async () => {
        let vars = await import(getPathROUTES(getToRunShortened(runs[4]).pathFile))
        if (element.results === '/') {
          nbVariablesShortenedDone++
          expect(vars.PAGE__ROOT, element.name).toBe(element.results)
        } else if (element.results === '/contract/abc') {
          nbVariablesShortenedDone++
          expect(vars.PAGE_contract_id('abc'), element.name).toBe(element.results)
        } else if (element.results === '/fr/site/Paris') {
          nbVariablesShortenedDone++
          expect(vars.PAGE_site_id({ id: 'Paris' }), element.name).toBe(element.results)
        } else if (element.results === '/main') {
          nbVariablesShortenedDone++
          expect(vars.PAGE_main(), element.name).toBe(element.results)
        } else if (element.results === '/contract?yop=hello') {
          nbVariablesShortenedDone++
          expect(vars.PAGE_contract({}, { yop: 'hello' }), element.name).toBe(element.results)
        } else if (element.results === 'https://twitter.com/jycouet') {
          nbVariablesShortenedDone++
          expect(vars.LINK_twitter, element.name).toBe(element.results)
        } else if (element.results === '/fr/site_contract/Paris-abc?limit=2') {
          nbVariablesShortenedDone++
          expect(
            vars.PAGE_site_contract_siteId_contractId(...element.params_shortened),
            element.name,
          ).toBe(element.results)
        }
      })
    })
  }

  it('Check That all "variables" were done !', () => {
    expect(nbVariablesDone, 'not shortened').toBe(table.length)
    expect(nbVariablesShortenedDone, 'shortened').toBe(table.length)
  })

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
