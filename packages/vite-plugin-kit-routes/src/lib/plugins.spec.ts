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

  it('format /', () => {
    const generated_file_path = 'src/test/ROUTES_format-slash.ts'
    run({
      format: 'object[path]',
      generated_file_path,
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */

      /**
       * PAGES
       */
      export const PAGES = {
        \\"/\\": \`/\`,
        \\"/subGroup\\": \`/subGroup\`,
        \\"/subGroup2\\": \`/subGroup2\`,
        \\"/contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"/contract/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"/gp/one\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
        },
        \\"/gp/two\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
        },
        \\"/main\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
        },
        \\"/match/[id=int]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
        },
        \\"/site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"/site/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\`
        },
        \\"/site_contract/[siteId]-[contractId]\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\`
        },
        \\"/a/[...rest]/z\\": (params: { rest: (string | number)[] }) => {
          return \`/a/\${params.rest?.join('/')}/z\`
        },
        \\"/lay/normal\\": \`/lay/normal\`,
        \\"/lay/root-layout\\": \`/lay/root-layout\`,
        \\"/lay/skip\\": \`/lay/skip\`
      }

      /**
       * SERVERS
       */
      export const SERVERS = {
        \\"GET /contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"POST /contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"GET /site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"GET /api/graphql\\": \`/api/graphql\`,
        \\"POST /api/graphql\\": \`/api/graphql\`
      }

      /**
       * ACTIONS
       */
      export const ACTIONS = {
        \\"default /contract/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"create /site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\`
        },
        \\"update /site/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\`
        },
        \\"delete /site/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\`
        },
        \\"noSatisfies /site_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\`
        },
        \\"send /site_contract/[siteId]-[contractId]\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\`
        }
      }

      /**
       * LINKS
       */
      export const LINKS = {
        \\"twitter\\": \`https:/twitter.com/jycouet\`,
        \\"twitter_post\\": (params: { name: (string | number), id: (string | number) }) => {
          return \`https:/twitter.com/\${params.name}/status/\${params.id}\`
        },
        \\"gravatar\\": (params: { str: (string | number), s?: (number), d?: (\\"retro\\" | \\"identicon\\") }) => {
          params.s = params.s ?? 75; 
          params.d = params.d ?? \\"identicon\\"; 
          return \`https:/www.gravatar.com/avatar/\${params.str}\${appendSp({ s: params?.s, d: params?.d })}\`
        }
      }

      /**
       * Append search params to a string
       */
      const appendSp = (sp?: Record<string, string | number | undefined>, prefix: '?' | '&' = '?') => {
        if (sp === undefined) return ''
        const mapping = Object.entries(sp)
          .filter(c => c[1] !== undefined)
          .map(c => [c[0], String(c[1])])

        const formated = new URLSearchParams(mapping).toString()
        if (formated) {
          return \`\${prefix}\${formated}\`
        }
        return ''
      }

      /**
      * Add this type as a generic of the vite plugin \`kitRoutes<KIT_ROUTES>\`.
      * 
      * Full example:
      * \`\`\`ts
      * import type { KIT_ROUTES } from '$lib/ROUTES'
      * import { kitRoutes } from 'vite-plugin-kit-routes'
      * 
      * kitRoutes<KIT_ROUTES>({
      *  PAGES: {
      *    // here, key of object will be typed!
      *  }
      * })
      * \`\`\`
      */
      export type KIT_ROUTES = { 
        PAGES: { '/': never, '/subGroup': never, '/subGroup2': never, '/contract': 'lang', '/contract/[id]': 'id' | 'lang', '/gp/one': 'lang', '/gp/two': 'lang', '/main': 'lang', '/match/[id=int]': 'id' | 'lang', '/site': 'lang', '/site/[id]': 'id' | 'lang', '/site_contract/[siteId]-[contractId]': 'siteId' | 'contractId' | 'lang', '/a/[...rest]/z': 'rest', '/lay/normal': never, '/lay/root-layout': never, '/lay/skip': never }
        SERVERS: { 'GET /contract': 'lang', 'POST /contract': 'lang', 'GET /site': 'lang', 'GET /api/graphql': never, 'POST /api/graphql': never }
        ACTIONS: { 'default /contract/[id]': 'id' | 'lang', 'create /site': 'lang', 'update /site/[id]': 'id' | 'lang', 'delete /site/[id]': 'id' | 'lang', 'noSatisfies /site_contract': 'lang', 'send /site_contract/[siteId]-[contractId]': 'siteId' | 'contractId' | 'lang' }
        LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
        Params: { lang: never, id: never, siteId: never, contractId: never, rest: never, name: never, str: never, s: never, d: never }
      }
      "
    `)
  })

  it('format _', () => {
    const generated_file_path = 'src/test/ROUTES_format-underscore.ts'
    run({
      generated_file_path,
      format: 'object[symbol]',
      ...commonConfigFormat_underscore,
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */

      /**
       * PAGES
       */
      export const PAGES = {
        \\"_ROOT\\": \`/\`,
        \\"subGroup\\": \`/subGroup\`,
        \\"subGroup2\\": (params: { first: (string | number) }) => {
          return \`/subGroup2\${appendSp({ first: params?.first })}\`
        },
        \\"contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }, sp?: Record<string, string | number>) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\${appendSp(sp)}\`
        },
        \\"contract_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"gp_one\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
        },
        \\"gp_two\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
        },
        \\"main\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
        },
        \\"match_id_int\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
        },
        \\"site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\${appendSp({ limit: params?.limit, ...sp })}\`
        },
        \\"site_id\\": (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
          params = params ?? {}
          params.lang = params.lang ?? \\"fr\\"; 
          params.id = params.id ?? \\"Vienna\\"; 
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\${appendSp({ limit: params?.limit, demo: params?.demo })}\`
        },
        \\"site_contract_siteId_contractId\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\${appendSp({ limit: params?.limit })}\`
        },
        \\"a_rest_z\\": (params: { rest: (string | number)[] }) => {
          return \`/a/\${params.rest?.join('/')}/z\`
        },
        \\"lay_normal\\": \`/lay/normal\`,
        \\"lay_root_layout\\": \`/lay/root-layout\`,
        \\"lay_skip\\": \`/lay/skip\`
      }

      /**
       * SERVERS
       */
      export const SERVERS = {
        \\"GET_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"POST_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"GET_site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"GET_api_graphql\\": \`/api/graphql\`,
        \\"POST_api_graphql\\": \`/api/graphql\`
      }

      /**
       * ACTIONS
       */
      export const ACTIONS = {
        \\"default_contract_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\${appendSp({ limit: params?.limit })}\`
        },
        \\"create_site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\`
        },
        \\"update_site_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\`
        },
        \\"delete_site_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\`
        },
        \\"noSatisfies_site_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\`
        },
        \\"send_site_contract_siteId_contractId\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), extra?: ('A' | 'B') }) => {
          params.extra = params.extra ?? \\"A\\"; 
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\${appendSp({ extra: params?.extra }, '&')}\`
        }
      }

      /**
       * LINKS
       */
      export const LINKS = {
        \\"twitter\\": \`https:/twitter.com/jycouet\`,
        \\"twitter_post\\": (params: { name: (string | number), id: (string | number) }) => {
          return \`https:/twitter.com/\${params.name}/status/\${params.id}\`
        },
        \\"gravatar\\": (params: { str: (string | number), s?: (number), d?: (\\"retro\\" | \\"identicon\\") }) => {
          params.s = params.s ?? 75; 
          params.d = params.d ?? \\"identicon\\"; 
          return \`https:/www.gravatar.com/avatar/\${params.str}\${appendSp({ s: params?.s, d: params?.d })}\`
        }
      }

      /**
       * Append search params to a string
       */
      const appendSp = (sp?: Record<string, string | number | undefined>, prefix: '?' | '&' = '?') => {
        if (sp === undefined) return ''
        const mapping = Object.entries(sp)
          .filter(c => c[1] !== undefined)
          .map(c => [c[0], String(c[1])])

        const formated = new URLSearchParams(mapping).toString()
        if (formated) {
          return \`\${prefix}\${formated}\`
        }
        return ''
      }

      /**
      * Add this type as a generic of the vite plugin \`kitRoutes<KIT_ROUTES>\`.
      * 
      * Full example:
      * \`\`\`ts
      * import type { KIT_ROUTES } from '$lib/ROUTES'
      * import { kitRoutes } from 'vite-plugin-kit-routes'
      * 
      * kitRoutes<KIT_ROUTES>({
      *  PAGES: {
      *    // here, key of object will be typed!
      *  }
      * })
      * \`\`\`
      */
      export type KIT_ROUTES = { 
        PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup2': never, 'contract': 'lang', 'contract_id': 'id' | 'lang', 'gp_one': 'lang', 'gp_two': 'lang', 'main': 'lang', 'match_id_int': 'id' | 'lang', 'site': 'lang', 'site_id': 'lang' | 'id', 'site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang', 'a_rest_z': 'rest', 'lay_normal': never, 'lay_root_layout': never, 'lay_skip': never }
        SERVERS: { 'GET_contract': 'lang', 'POST_contract': 'lang', 'GET_site': 'lang', 'GET_api_graphql': never, 'POST_api_graphql': never }
        ACTIONS: { 'default_contract_id': 'id' | 'lang', 'create_site': 'lang', 'update_site_id': 'id' | 'lang', 'delete_site_id': 'id' | 'lang', 'noSatisfies_site_contract': 'lang', 'send_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang' }
        LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
        Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, rest: never, extra: never, name: never, str: never, s: never, d: never }
      }
      "
    `)
  })

  it("format route('/')", () => {
    const generated_file_path = 'src/test/ROUTES_format-route-slash.ts'
    run({
      generated_file_path,
      format: 'route(path)',
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */

      /**
       * PAGES
       */
      const PAGES = {
        \\"/\\": \`/\`,
        \\"/subGroup\\": \`/subGroup\`,
        \\"/subGroup2\\": \`/subGroup2\`,
        \\"/contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"/contract/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"/gp/one\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
        },
        \\"/gp/two\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
        },
        \\"/main\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
        },
        \\"/match/[id=int]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
        },
        \\"/site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"/site/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\`
        },
        \\"/site_contract/[siteId]-[contractId]\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\`
        },
        \\"/a/[...rest]/z\\": (params: { rest: (string | number)[] }) => {
          return \`/a/\${params.rest?.join('/')}/z\`
        },
        \\"/lay/normal\\": \`/lay/normal\`,
        \\"/lay/root-layout\\": \`/lay/root-layout\`,
        \\"/lay/skip\\": \`/lay/skip\`
      }

      /**
       * SERVERS
       */
      const SERVERS = {
        \\"GET /contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"POST /contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"GET /site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"GET /api/graphql\\": \`/api/graphql\`,
        \\"POST /api/graphql\\": \`/api/graphql\`
      }

      /**
       * ACTIONS
       */
      const ACTIONS = {
        \\"default /contract/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"create /site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\`
        },
        \\"update /site/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\`
        },
        \\"delete /site/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\`
        },
        \\"noSatisfies /site_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\`
        },
        \\"send /site_contract/[siteId]-[contractId]\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\`
        }
      }

      /**
       * LINKS
       */
      const LINKS = {
        \\"twitter\\": \`https:/twitter.com/jycouet\`,
        \\"twitter_post\\": (params: { name: (string | number), id: (string | number) }) => {
          return \`https:/twitter.com/\${params.name}/status/\${params.id}\`
        },
        \\"gravatar\\": (params: { str: (string | number), s?: (number), d?: (\\"retro\\" | \\"identicon\\") }) => {
          params.s = params.s ?? 75; 
          params.d = params.d ?? \\"identicon\\"; 
          return \`https:/www.gravatar.com/avatar/\${params.str}\${appendSp({ s: params?.s, d: params?.d })}\`
        }
      }

      /**
       * Append search params to a string
       */
      const appendSp = (sp?: Record<string, string | number | undefined>, prefix: '?' | '&' = '?') => {
        if (sp === undefined) return ''
        const mapping = Object.entries(sp)
          .filter(c => c[1] !== undefined)
          .map(c => [c[0], String(c[1])])

        const formated = new URLSearchParams(mapping).toString()
        if (formated) {
          return \`\${prefix}\${formated}\`
        }
        return ''
      }

      // route function helpers
      type NonFunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
      type FunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
      type FunctionParams<T> = T extends (...args: infer P) => any ? P : never

      const AllObjs = { ...PAGES, ...ACTIONS, ...SERVERS, ...LINKS }
      type AllTypes = typeof AllObjs

      /**
       * To be used like this: 
       * \`\`\`ts
       * import { route } from '$lib/ROUTES'
       * 
       * route('site_id', { id: 1 })
       * \`\`\`
       */
      export function route<T extends FunctionKeys<AllTypes>>(key: T, ...params: FunctionParams<AllTypes[T]>): string
      export function route<T extends NonFunctionKeys<AllTypes>>(key: T): string
      export function route<T extends keyof AllTypes>(key: T, ...params: any[]): string {
        if (typeof AllObjs[key] === 'function') {
          const element = (AllObjs as any)[key] as (...args: any[]) => any
          return element(...params)
        } else {
          return AllObjs[key] as string
        }
      }

      /**
      * Add this type as a generic of the vite plugin \`kitRoutes<KIT_ROUTES>\`.
      * 
      * Full example:
      * \`\`\`ts
      * import type { KIT_ROUTES } from '$lib/ROUTES'
      * import { kitRoutes } from 'vite-plugin-kit-routes'
      * 
      * kitRoutes<KIT_ROUTES>({
      *  PAGES: {
      *    // here, key of object will be typed!
      *  }
      * })
      * \`\`\`
      */
      export type KIT_ROUTES = { 
        PAGES: { '/': never, '/subGroup': never, '/subGroup2': never, '/contract': 'lang', '/contract/[id]': 'id' | 'lang', '/gp/one': 'lang', '/gp/two': 'lang', '/main': 'lang', '/match/[id=int]': 'id' | 'lang', '/site': 'lang', '/site/[id]': 'id' | 'lang', '/site_contract/[siteId]-[contractId]': 'siteId' | 'contractId' | 'lang', '/a/[...rest]/z': 'rest', '/lay/normal': never, '/lay/root-layout': never, '/lay/skip': never }
        SERVERS: { 'GET /contract': 'lang', 'POST /contract': 'lang', 'GET /site': 'lang', 'GET /api/graphql': never, 'POST /api/graphql': never }
        ACTIONS: { 'default /contract/[id]': 'id' | 'lang', 'create /site': 'lang', 'update /site/[id]': 'id' | 'lang', 'delete /site/[id]': 'id' | 'lang', 'noSatisfies /site_contract': 'lang', 'send /site_contract/[siteId]-[contractId]': 'siteId' | 'contractId' | 'lang' }
        LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
        Params: { lang: never, id: never, siteId: never, contractId: never, rest: never, name: never, str: never, s: never, d: never }
      }
      "
    `)
  })

  it("format route('_')", () => {
    const generated_file_path = 'src/test/ROUTES_format-route-underscore.ts'
    run({
      generated_file_path,
      format: 'route(symbol, {})',
      ...commonConfigFormat_underscore_space,
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */

      /**
       * PAGES
       */
      const PAGES = {
        \\"_ROOT\\": \`/\`,
        \\"subGroup\\": \`/subGroup\`,
        \\"subGroup2\\": (params: { first: (string | number) }) => {
          return \`/subGroup2\${appendSp({ first: params?.first })}\`
        },
        \\"contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }, sp?: Record<string, string | number>) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\${appendSp(sp)}\`
        },
        \\"contract_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"gp_one\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
        },
        \\"gp_two\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
        },
        \\"main\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
        },
        \\"match_id_int\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
        },
        \\"site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\${appendSp({ limit: params?.limit, ...sp })}\`
        },
        \\"site_id\\": (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
          params = params ?? {}
          params.lang = params.lang ?? \\"fr\\"; 
          params.id = params.id ?? \\"Vienna\\"; 
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\${appendSp({ limit: params?.limit, demo: params?.demo })}\`
        },
        \\"site_contract_siteId_contractId\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\${appendSp({ limit: params?.limit })}\`
        },
        \\"a_rest_z\\": (params: { rest: (string | number)[] }) => {
          return \`/a/\${params.rest?.join('/')}/z\`
        },
        \\"lay_normal\\": \`/lay/normal\`,
        \\"lay_root_layout\\": \`/lay/root-layout\`,
        \\"lay_skip\\": \`/lay/skip\`
      }

      /**
       * SERVERS
       */
      const SERVERS = {
        \\"GET contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"POST contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"GET site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"GET api_graphql\\": \`/api/graphql\`,
        \\"POST api_graphql\\": \`/api/graphql\`
      }

      /**
       * ACTIONS
       */
      const ACTIONS = {
        \\"default contract_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\${appendSp({ limit: params?.limit })}\`
        },
        \\"create site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\`
        },
        \\"update site_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\`
        },
        \\"delete site_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\`
        },
        \\"noSatisfies site_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\`
        },
        \\"send site_contract_siteId_contractId\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), extra?: ('A' | 'B') }) => {
          params.extra = params.extra ?? \\"A\\"; 
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\${appendSp({ extra: params?.extra }, '&')}\`
        }
      }

      /**
       * LINKS
       */
      const LINKS = {
        \\"twitter\\": \`https:/twitter.com/jycouet\`,
        \\"twitter_post\\": (params: { name: (string | number), id: (string | number) }) => {
          return \`https:/twitter.com/\${params.name}/status/\${params.id}\`
        },
        \\"gravatar\\": (params: { str: (string | number), s?: (number), d?: (\\"retro\\" | \\"identicon\\") }) => {
          params.s = params.s ?? 75; 
          params.d = params.d ?? \\"identicon\\"; 
          return \`https:/www.gravatar.com/avatar/\${params.str}\${appendSp({ s: params?.s, d: params?.d })}\`
        }
      }

      /**
       * Append search params to a string
       */
      const appendSp = (sp?: Record<string, string | number | undefined>, prefix: '?' | '&' = '?') => {
        if (sp === undefined) return ''
        const mapping = Object.entries(sp)
          .filter(c => c[1] !== undefined)
          .map(c => [c[0], String(c[1])])

        const formated = new URLSearchParams(mapping).toString()
        if (formated) {
          return \`\${prefix}\${formated}\`
        }
        return ''
      }

      // route function helpers
      type NonFunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
      type FunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
      type FunctionParams<T> = T extends (...args: infer P) => any ? P : never

      const AllObjs = { ...PAGES, ...ACTIONS, ...SERVERS, ...LINKS }
      type AllTypes = typeof AllObjs

      /**
       * To be used like this: 
       * \`\`\`ts
       * import { route } from '$lib/ROUTES'
       * 
       * route('site_id', { id: 1 })
       * \`\`\`
       */
      export function route<T extends FunctionKeys<AllTypes>>(key: T, ...params: FunctionParams<AllTypes[T]>): string
      export function route<T extends NonFunctionKeys<AllTypes>>(key: T): string
      export function route<T extends keyof AllTypes>(key: T, ...params: any[]): string {
        if (typeof AllObjs[key] === 'function') {
          const element = (AllObjs as any)[key] as (...args: any[]) => any
          return element(...params)
        } else {
          return AllObjs[key] as string
        }
      }

      /**
      * Add this type as a generic of the vite plugin \`kitRoutes<KIT_ROUTES>\`.
      * 
      * Full example:
      * \`\`\`ts
      * import type { KIT_ROUTES } from '$lib/ROUTES'
      * import { kitRoutes } from 'vite-plugin-kit-routes'
      * 
      * kitRoutes<KIT_ROUTES>({
      *  PAGES: {
      *    // here, key of object will be typed!
      *  }
      * })
      * \`\`\`
      */
      export type KIT_ROUTES = { 
        PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup2': never, 'contract': 'lang', 'contract_id': 'id' | 'lang', 'gp_one': 'lang', 'gp_two': 'lang', 'main': 'lang', 'match_id_int': 'id' | 'lang', 'site': 'lang', 'site_id': 'lang' | 'id', 'site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang', 'a_rest_z': 'rest', 'lay_normal': never, 'lay_root_layout': never, 'lay_skip': never }
        SERVERS: { 'GET contract': 'lang', 'POST contract': 'lang', 'GET site': 'lang', 'GET api_graphql': never, 'POST api_graphql': never }
        ACTIONS: { 'default contract_id': 'id' | 'lang', 'create site': 'lang', 'update site_id': 'id' | 'lang', 'delete site_id': 'id' | 'lang', 'noSatisfies site_contract': 'lang', 'send site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang' }
        LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
        Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, rest: never, extra: never, name: never, str: never, s: never, d: never }
      }
      "
    `)
  })

  it('format variables', () => {
    const generated_file_path = 'src/test/ROUTES_format-variables.ts'
    run({
      generated_file_path,
      format: 'variables',
      ...commonConfigFormat_underscore,
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */

      /**
       * PAGES
       */
      export const PAGE__ROOT = \`/\`
      export const PAGE_subGroup = \`/subGroup\`
      export const PAGE_subGroup2 = (params: { first: (string | number) }) => {
        return \`/subGroup2\${appendSp({ first: params?.first })}\` 
      }
      export const PAGE_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }, sp?: Record<string, string | number>) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\${appendSp(sp)}\` 
      }
      export const PAGE_contract_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\` 
      }
      export const PAGE_gp_one = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\` 
      }
      export const PAGE_gp_two = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\` 
      }
      export const PAGE_main = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\` 
      }
      export const PAGE_match_id_int = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\` 
      }
      export const PAGE_site = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\${appendSp({ limit: params?.limit, ...sp })}\` 
      }
      export const PAGE_site_id = (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
        params = params ?? {}
        params.lang = params.lang ?? \\"fr\\"; 
        params.id = params.id ?? \\"Vienna\\"; 
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\${appendSp({ limit: params?.limit, demo: params?.demo })}\` 
      }
      export const PAGE_site_contract_siteId_contractId = (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\${appendSp({ limit: params?.limit })}\` 
      }
      export const PAGE_a_rest_z = (params: { rest: (string | number)[] }) => {
        return \`/a/\${params.rest?.join('/')}/z\` 
      }
      export const PAGE_lay_normal = \`/lay/normal\`
      export const PAGE_lay_root_layout = \`/lay/root-layout\`
      export const PAGE_lay_skip = \`/lay/skip\`

      /**
       * SERVERS
       */
      export const SERVER_GET_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\` 
      }
      export const SERVER_POST_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\` 
      }
      export const SERVER_GET_site = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\` 
      }
      export const SERVER_GET_api_graphql = \`/api/graphql\`
      export const SERVER_POST_api_graphql = \`/api/graphql\`

      /**
       * ACTIONS
       */
      export const ACTION_default_contract_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\${appendSp({ limit: params?.limit })}\` 
      }
      export const ACTION_create_site = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\` 
      }
      export const ACTION_update_site_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\` 
      }
      export const ACTION_delete_site_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\` 
      }
      export const ACTION_noSatisfies_site_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\` 
      }
      export const ACTION_send_site_contract_siteId_contractId = (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), extra?: ('A' | 'B') }) => {
        params.extra = params.extra ?? \\"A\\"; 
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\${appendSp({ extra: params?.extra }, '&')}\` 
      }

      /**
       * LINKS
       */
      export const LINK_twitter = \`https:/twitter.com/jycouet\`
      export const LINK_twitter_post = (params: { name: (string | number), id: (string | number) }) => {
        return \`https:/twitter.com/\${params.name}/status/\${params.id}\` 
      }
      export const LINK_gravatar = (params: { str: (string | number), s?: (number), d?: (\\"retro\\" | \\"identicon\\") }) => {
        params.s = params.s ?? 75; 
        params.d = params.d ?? \\"identicon\\"; 
        return \`https:/www.gravatar.com/avatar/\${params.str}\${appendSp({ s: params?.s, d: params?.d })}\` 
      }

      /**
       * Append search params to a string
       */
      const appendSp = (sp?: Record<string, string | number | undefined>, prefix: '?' | '&' = '?') => {
        if (sp === undefined) return ''
        const mapping = Object.entries(sp)
          .filter(c => c[1] !== undefined)
          .map(c => [c[0], String(c[1])])

        const formated = new URLSearchParams(mapping).toString()
        if (formated) {
          return \`\${prefix}\${formated}\`
        }
        return ''
      }

      /**
      * Add this type as a generic of the vite plugin \`kitRoutes<KIT_ROUTES>\`.
      * 
      * Full example:
      * \`\`\`ts
      * import type { KIT_ROUTES } from '$lib/ROUTES'
      * import { kitRoutes } from 'vite-plugin-kit-routes'
      * 
      * kitRoutes<KIT_ROUTES>({
      *  PAGES: {
      *    // here, key of object will be typed!
      *  }
      * })
      * \`\`\`
      */
      export type KIT_ROUTES = { 
        PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup2': never, 'contract': 'lang', 'contract_id': 'id' | 'lang', 'gp_one': 'lang', 'gp_two': 'lang', 'main': 'lang', 'match_id_int': 'id' | 'lang', 'site': 'lang', 'site_id': 'lang' | 'id', 'site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang', 'a_rest_z': 'rest', 'lay_normal': never, 'lay_root_layout': never, 'lay_skip': never }
        SERVERS: { 'GET_contract': 'lang', 'POST_contract': 'lang', 'GET_site': 'lang', 'GET_api_graphql': never, 'POST_api_graphql': never }
        ACTIONS: { 'default_contract_id': 'id' | 'lang', 'create_site': 'lang', 'update_site_id': 'id' | 'lang', 'delete_site_id': 'id' | 'lang', 'noSatisfies_site_contract': 'lang', 'send_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang' }
        LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
        Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, rest: never, extra: never, name: never, str: never, s: never, d: never }
      }
      "
    `)
  })

  it('post_update_run', () => {
    const generated_file_path = 'src/test/ROUTES_post-update.ts'
    run({
      generated_file_path,
      post_update_run: 'echo done',
    })
  })

  it('with path base', () => {
    const generated_file_path = 'src/test/ROUTES_base.ts'
    run({
      generated_file_path,
      format: 'object[symbol]',
      path_base: true,
      ...commonConfigFormat_underscore,
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */
      import { base } from '$app/paths'

      /**
       * PAGES
       */
      export const PAGES = {
        \\"_ROOT\\": \`\${base}/\`,
        \\"subGroup\\": \`\${base}/subGroup\`,
        \\"subGroup2\\": (params: { first: (string | number) }) => {
          return \`\${base}/subGroup2\${appendSp({ first: params?.first })}\`
        },
        \\"contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }, sp?: Record<string, string | number>) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\${appendSp(sp)}\`
        },
        \\"contract_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"gp_one\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
        },
        \\"gp_two\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
        },
        \\"main\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
        },
        \\"match_id_int\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
        },
        \\"site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site\${appendSp({ limit: params?.limit, ...sp })}\`
        },
        \\"site_id\\": (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
          params = params ?? {}
          params.lang = params.lang ?? \\"fr\\"; 
          params.id = params.id ?? \\"Vienna\\"; 
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\${appendSp({ limit: params?.limit, demo: params?.demo })}\`
        },
        \\"site_contract_siteId_contractId\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\${appendSp({ limit: params?.limit })}\`
        },
        \\"a_rest_z\\": (params: { rest: (string | number)[] }) => {
          return \`\${base}/a/\${params.rest?.join('/')}/z\`
        },
        \\"lay_normal\\": \`\${base}/lay/normal\`,
        \\"lay_root_layout\\": \`\${base}/lay/root-layout\`,
        \\"lay_skip\\": \`\${base}/lay/skip\`
      }

      /**
       * SERVERS
       */
      export const SERVERS = {
        \\"GET_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"POST_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"GET_site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"GET_api_graphql\\": \`\${base}/api/graphql\`,
        \\"POST_api_graphql\\": \`\${base}/api/graphql\`
      }

      /**
       * ACTIONS
       */
      export const ACTIONS = {
        \\"default_contract_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\${appendSp({ limit: params?.limit })}\`
        },
        \\"create_site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\`
        },
        \\"update_site_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\`
        },
        \\"delete_site_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\`
        },
        \\"noSatisfies_site_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\`
        },
        \\"send_site_contract_siteId_contractId\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), extra?: ('A' | 'B') }) => {
          params.extra = params.extra ?? \\"A\\"; 
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\${appendSp({ extra: params?.extra }, '&')}\`
        }
      }

      /**
       * LINKS
       */
      export const LINKS = {
        \\"twitter\\": \`\${base}https:/twitter.com/jycouet\`,
        \\"twitter_post\\": (params: { name: (string | number), id: (string | number) }) => {
          return \`\${base}https:/twitter.com/\${params.name}/status/\${params.id}\`
        },
        \\"gravatar\\": (params: { str: (string | number), s?: (number), d?: (\\"retro\\" | \\"identicon\\") }) => {
          params.s = params.s ?? 75; 
          params.d = params.d ?? \\"identicon\\"; 
          return \`\${base}https:/www.gravatar.com/avatar/\${params.str}\${appendSp({ s: params?.s, d: params?.d })}\`
        }
      }

      /**
       * Append search params to a string
       */
      const appendSp = (sp?: Record<string, string | number | undefined>, prefix: '?' | '&' = '?') => {
        if (sp === undefined) return ''
        const mapping = Object.entries(sp)
          .filter(c => c[1] !== undefined)
          .map(c => [c[0], String(c[1])])

        const formated = new URLSearchParams(mapping).toString()
        if (formated) {
          return \`\${prefix}\${formated}\`
        }
        return ''
      }

      /**
      * Add this type as a generic of the vite plugin \`kitRoutes<KIT_ROUTES>\`.
      * 
      * Full example:
      * \`\`\`ts
      * import type { KIT_ROUTES } from '$lib/ROUTES'
      * import { kitRoutes } from 'vite-plugin-kit-routes'
      * 
      * kitRoutes<KIT_ROUTES>({
      *  PAGES: {
      *    // here, key of object will be typed!
      *  }
      * })
      * \`\`\`
      */
      export type KIT_ROUTES = { 
        PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup2': never, 'contract': 'lang', 'contract_id': 'id' | 'lang', 'gp_one': 'lang', 'gp_two': 'lang', 'main': 'lang', 'match_id_int': 'id' | 'lang', 'site': 'lang', 'site_id': 'lang' | 'id', 'site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang', 'a_rest_z': 'rest', 'lay_normal': never, 'lay_root_layout': never, 'lay_skip': never }
        SERVERS: { 'GET_contract': 'lang', 'POST_contract': 'lang', 'GET_site': 'lang', 'GET_api_graphql': never, 'POST_api_graphql': never }
        ACTIONS: { 'default_contract_id': 'id' | 'lang', 'create_site': 'lang', 'update_site_id': 'id' | 'lang', 'delete_site_id': 'id' | 'lang', 'noSatisfies_site_contract': 'lang', 'send_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang' }
        LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
        Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, rest: never, extra: never, name: never, str: never, s: never, d: never }
      }
      "
    `)
  })
})
