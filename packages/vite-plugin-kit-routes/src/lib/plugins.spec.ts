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
    expect(formatKey('/[param]site/[yop](group)/[id]')).toMatchInlineSnapshot(
      '"/[param]site/[yop]/[id]"',
    )
  })

  it('formatKey /l', async () => {
    expect(formatKey('/[param]site/[yop](group)/[id]', { format: '/' })).toMatchInlineSnapshot(
      '"/[param]site/[yop]/[id]"',
    )
  })

  it('formatKey _', async () => {
    expect(formatKey('/[param]site/[yop](group)/[id]', { format: '_' })).toMatchInlineSnapshot(
      '"param_site_yop_id"',
    )
  })

  it('formatKey / starting with group', async () => {
    expect(formatKey('/(group)/test', { format: '/' })).toMatchInlineSnapshot('"/test"')
  })

  it('formatKey _ starting with group', async () => {
    expect(formatKey('/(group)/test', { format: '_' })).toMatchInlineSnapshot('"test"')
  })

  it('formatKey group original', async () => {
    expect(formatKey('/[param]site/[yop](group)/[id]', { format: '_' })).toMatchInlineSnapshot(
      '"param_site_yop_id"',
    )
  })

  it('formatKey ROOT', async () => {
    expect(formatKey('/')).toMatchInlineSnapshot('"/"')
  })

  it('fileToMetadata optional only', async () => {
    const key = '/[[lang]]'
    const meta = transformToMetadata(key, key, 'PAGES', undefined, undefined)
    if (meta) {
      expect(meta).toMatchInlineSnapshot(`
        [
          {
            "keyToUse": "/[[lang]]",
            "key_wo_prefix": "/[[lang]]",
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
    const meta = transformToMetadata(key, key, 'PAGES', undefined, undefined)
    if (meta) {
      expect(meta).toMatchInlineSnapshot(`
        [
          {
            "keyToUse": "/[[lang]]/about",
            "key_wo_prefix": "/[[lang]]/about",
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
    const meta = transformToMetadata(key, key, 'PAGES', undefined, undefined)
    if (meta) {
      expect(meta).toMatchInlineSnapshot(`
        [
          {
            "keyToUse": "/prefix-[[lang]]/about",
            "key_wo_prefix": "/prefix-[[lang]]/about",
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

  const commonConfigFormat1: Options = {
    PAGES: {
      subGroup2: {
        explicit_search_params: {
          first: {
            required: true,
          },
        },
      },
      lang_contract: {
        extra_search_params: 'with',
      },
      lang_site: {
        explicit_search_params: { limit: { type: 'number' } },
        params: {
          // yop: { type: 'number' },
        },
        extra_search_params: 'with',
      },
      lang_site_id: {
        explicit_search_params: { limit: { type: 'number' }, demo: { type: 'string' } },
        params: {
          id: { type: 'string', default: '"Vienna"' },
          lang: { type: "'fr' | 'hu' | undefined", default: '"fr"' },
        },
      },
      lang_site_contract_siteId_contractId: {
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
      default_lang_contract_id: {
        explicit_search_params: {
          limit: { type: 'number' },
        },
      },
      send_lang_site_contract_siteId_contractId: {
        explicit_search_params: {
          extra: { type: "'A' | 'B'", default: '"A"' },
        },
      },
    },
  }

  it('format /', () => {
    const generated_file_path = 'src/test/ROUTES_format1.ts'
    run({
      generated_file_path,
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */

      export const PAGES = {
        \\"/\\": \`/\`,
        \\"/subGroup\\": \`/subGroup\`,
        \\"/subGroup2\\": \`/subGroup2\`,
        \\"/[[lang]]/contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"/[[lang]]/contract/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"/[[lang]]/gp/one\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
        },
        \\"/[[lang]]/gp/two\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
        },
        \\"/[[lang]]/main\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
        },
        \\"/[[lang]]/match/[id=int]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
        },
        \\"/[[lang]]/site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"/[[lang]]/site/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\`
        },
        \\"/[[lang]]/site_contract/[siteId]-[contractId]\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\`
        },
        \\"/a/[...rest]/z\\": (params: { rest: (string | number)[] }) => {
          return \`/a/\${params.rest?.join('/')}/z\`
        },
        \\"/lay/normal\\": \`/lay/normal\`,
        \\"/lay/root-layout\\": \`/lay/root-layout\`,
        \\"/lay/skip\\": \`/lay/skip\`
      }

      export const SERVERS = {
        \\"GET_/[[lang]]/contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"POST_/[[lang]]/contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"GET_/[[lang]]/site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"GET_/api/graphql\\": \`/api/graphql\`,
        \\"POST_/api/graphql\\": \`/api/graphql\`
      }

      export const ACTIONS = {
        \\"default_/[[lang]]/contract/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"create_/[[lang]]/site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\`
        },
        \\"update_/[[lang]]/site/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\`
        },
        \\"delete_/[[lang]]/site/[id]\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\`
        },
        \\"noSatisfies_/[[lang]]/site_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\`
        },
        \\"send_/[[lang]]/site_contract/[siteId]-[contractId]\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\`
        }
      }

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
        PAGES: { '/': never, '/subGroup': never, '/subGroup2': never, '/[[lang]]/contract': 'lang', '/[[lang]]/contract/[id]': 'id' | 'lang', '/[[lang]]/gp/one': 'lang', '/[[lang]]/gp/two': 'lang', '/[[lang]]/main': 'lang', '/[[lang]]/match/[id=int]': 'id' | 'lang', '/[[lang]]/site': 'lang', '/[[lang]]/site/[id]': 'id' | 'lang', '/[[lang]]/site_contract/[siteId]-[contractId]': 'siteId' | 'contractId' | 'lang', '/a/[...rest]/z': 'rest', '/lay/normal': never, '/lay/root-layout': never, '/lay/skip': never }
        SERVERS: { 'GET_/[[lang]]/contract': 'lang', 'POST_/[[lang]]/contract': 'lang', 'GET_/[[lang]]/site': 'lang', 'GET_/api/graphql': never, 'POST_/api/graphql': never }
        ACTIONS: { 'default_/[[lang]]/contract/[id]': 'id' | 'lang', 'create_/[[lang]]/site': 'lang', 'update_/[[lang]]/site/[id]': 'id' | 'lang', 'delete_/[[lang]]/site/[id]': 'id' | 'lang', 'noSatisfies_/[[lang]]/site_contract': 'lang', 'send_/[[lang]]/site_contract/[siteId]-[contractId]': 'siteId' | 'contractId' | 'lang' }
        LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
        Params: { lang: never, id: never, siteId: never, contractId: never, rest: never, name: never, str: never, s: never, d: never }
      }
      "
    `)
  })

  it('format _', () => {
    const generated_file_path = 'src/test/ROUTES_format2.ts'
    run({
      generated_file_path,
      format: '_',
      ...commonConfigFormat1,
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */

      export const PAGES = {
        \\"_ROOT\\": \`/\`,
        \\"subGroup\\": \`/subGroup\`,
        \\"subGroup2\\": (params: { first: (string | number) }) => {
          return \`/subGroup2\${appendSp({ first: params?.first })}\`
        },
        \\"lang_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }, sp?: Record<string, string | number>) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\${appendSp(sp)}\`
        },
        \\"lang_contract_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"lang_gp_one\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
        },
        \\"lang_gp_two\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
        },
        \\"lang_main\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
        },
        \\"lang_match_id_int\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
        },
        \\"lang_site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\${appendSp({ limit: params?.limit, ...sp })}\`
        },
        \\"lang_site_id\\": (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
          params = params ?? {}
          params.lang = params.lang ?? \\"fr\\"; 
          params.id = params.id ?? \\"Vienna\\"; 
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\${appendSp({ limit: params?.limit, demo: params?.demo })}\`
        },
        \\"lang_site_contract_siteId_contractId\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\${appendSp({ limit: params?.limit })}\`
        },
        \\"a_rest_z\\": (params: { rest: (string | number)[] }) => {
          return \`/a/\${params.rest?.join('/')}/z\`
        },
        \\"lay_normal\\": \`/lay/normal\`,
        \\"lay_root_layout\\": \`/lay/root-layout\`,
        \\"lay_skip\\": \`/lay/skip\`
      }

      export const SERVERS = {
        \\"GET_lang_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"POST_lang_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"GET_lang_site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"GET_api_graphql\\": \`/api/graphql\`,
        \\"POST_api_graphql\\": \`/api/graphql\`
      }

      export const ACTIONS = {
        \\"default_lang_contract_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\${appendSp({ limit: params?.limit })}\`
        },
        \\"create_lang_site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\`
        },
        \\"update_lang_site_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\`
        },
        \\"delete_lang_site_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\`
        },
        \\"noSatisfies_lang_site_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\`
        },
        \\"send_lang_site_contract_siteId_contractId\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), extra?: ('A' | 'B') }) => {
          params.extra = params.extra ?? \\"A\\"; 
          return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\${appendSp({ extra: params?.extra }, '&')}\`
        }
      }

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
        PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup2': never, 'lang_contract': 'lang', 'lang_contract_id': 'id' | 'lang', 'lang_gp_one': 'lang', 'lang_gp_two': 'lang', 'lang_main': 'lang', 'lang_match_id_int': 'id' | 'lang', 'lang_site': 'lang', 'lang_site_id': 'lang' | 'id', 'lang_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang', 'a_rest_z': 'rest', 'lay_normal': never, 'lay_root_layout': never, 'lay_skip': never }
        SERVERS: { 'GET_lang_contract': 'lang', 'POST_lang_contract': 'lang', 'GET_lang_site': 'lang', 'GET_api_graphql': never, 'POST_api_graphql': never }
        ACTIONS: { 'default_lang_contract_id': 'id' | 'lang', 'create_lang_site': 'lang', 'update_lang_site_id': 'id' | 'lang', 'delete_lang_site_id': 'id' | 'lang', 'noSatisfies_lang_site_contract': 'lang', 'send_lang_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang' }
        LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
        Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, rest: never, extra: never, name: never, str: never, s: never, d: never }
      }
      "
    `)
  })

  it('format /', () => {
    const generated_file_path = 'src/test/ROUTES_format1.ts'
    run({
      generated_file_path,
      format: "route('/')",
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */

      export function route(key: '/'): string
      export function route(key: '/subGroup'): string
      export function route(key: '/subGroup2'): string
      export function route(key: '/[[lang]]/contract', params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: '/[[lang]]/contract/[id]', params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: '/[[lang]]/gp/one', params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: '/[[lang]]/gp/two', params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: '/[[lang]]/main', params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: '/[[lang]]/match/[id=int]', params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: '/[[lang]]/site', params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: '/[[lang]]/site/[id]', params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: '/[[lang]]/site_contract/[siteId]-[contractId]', params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: '/a/[...rest]/z', params: { rest: (string | number)[] }): string
      export function route(key: '/lay/normal'): string
      export function route(key: '/lay/root-layout'): string
      export function route(key: '/lay/skip'): string
      export function route(key: 'GET_/[[lang]]/contract', params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: 'POST_/[[lang]]/contract', params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: 'GET_/[[lang]]/site', params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: 'GET_/api/graphql'): string
      export function route(key: 'POST_/api/graphql'): string
      export function route(key: 'default_/[[lang]]/contract/[id]', params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: 'create_/[[lang]]/site', params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: 'update_/[[lang]]/site/[id]', params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: 'delete_/[[lang]]/site/[id]', params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: 'noSatisfies_/[[lang]]/site_contract', params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: 'send_/[[lang]]/site_contract/[siteId]-[contractId]', params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }): string
      export function route(key: 'twitter'): string
      export function route(key: 'twitter_post', params: { name: (string | number), id: (string | number) }): string
      export function route(key: 'gravatar', params: { str: (string | number), s?: (number), d?: (\\"retro\\" | \\"identicon\\") }): string
      export function route(key: any, ...args: any): string { 
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

        const params = args[0] ?? {}
        const action = args[1] ?? ''
        const method = args[1] ?? '' // Not used yet
        const sp = args[2] ?? ''

        switch(key) {
          case '/':
            return \`/\`
          case '/subGroup':
            return \`/subGroup\`
          case '/subGroup2':
            return \`/subGroup2\`
          case '/[[lang]]/contract':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
          case '/[[lang]]/contract/[id]':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
          case '/[[lang]]/gp/one':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
          case '/[[lang]]/gp/two':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
          case '/[[lang]]/main':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
          case '/[[lang]]/match/[id=int]':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
          case '/[[lang]]/site':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
          case '/[[lang]]/site/[id]':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\`
          case '/[[lang]]/site_contract/[siteId]-[contractId]':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\`
          case '/a/[...rest]/z':
            return \`/a/\${params.rest?.join('/')}/z\`
          case '/lay/normal':
            return \`/lay/normal\`
          case '/lay/root-layout':
            return \`/lay/root-layout\`
          case '/lay/skip':
            return \`/lay/skip\`
          case 'GET_/[[lang]]/contract':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
          case 'POST_/[[lang]]/contract':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
          case 'GET_/[[lang]]/site':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
          case 'GET_/api/graphql':
            return \`/api/graphql\`
          case 'POST_/api/graphql':
            return \`/api/graphql\`
          case 'default_/[[lang]]/contract/[id]':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
          case 'create_/[[lang]]/site':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\`
          case 'update_/[[lang]]/site/[id]':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\`
          case 'delete_/[[lang]]/site/[id]':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\`
          case 'noSatisfies_/[[lang]]/site_contract':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\`
          case 'send_/[[lang]]/site_contract/[siteId]-[contractId]':
            return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\`
          case 'twitter':
            return \`https:/twitter.com/jycouet\`
          case 'twitter_post':
            return \`https:/twitter.com/\${params.name}/status/\${params.id}\`
          case 'gravatar':
            params.s = params.s ?? 75; 
            params.d = params.d ?? \\"identicon\\"; 
            return \`https:/www.gravatar.com/avatar/\${params.str}\${appendSp({ s: params?.s, d: params?.d })}\`
        }
        
        // We should never arrive here
        return '/'
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
        PAGES: { '/': never, '/subGroup': never, '/subGroup2': never, '/[[lang]]/contract': 'lang', '/[[lang]]/contract/[id]': 'id' | 'lang', '/[[lang]]/gp/one': 'lang', '/[[lang]]/gp/two': 'lang', '/[[lang]]/main': 'lang', '/[[lang]]/match/[id=int]': 'id' | 'lang', '/[[lang]]/site': 'lang', '/[[lang]]/site/[id]': 'id' | 'lang', '/[[lang]]/site_contract/[siteId]-[contractId]': 'siteId' | 'contractId' | 'lang', '/a/[...rest]/z': 'rest', '/lay/normal': never, '/lay/root-layout': never, '/lay/skip': never }
        SERVERS: { 'GET_/[[lang]]/contract': 'lang', 'POST_/[[lang]]/contract': 'lang', 'GET_/[[lang]]/site': 'lang', 'GET_/api/graphql': never, 'POST_/api/graphql': never }
        ACTIONS: { 'default_/[[lang]]/contract/[id]': 'id' | 'lang', 'create_/[[lang]]/site': 'lang', 'update_/[[lang]]/site/[id]': 'id' | 'lang', 'delete_/[[lang]]/site/[id]': 'id' | 'lang', 'noSatisfies_/[[lang]]/site_contract': 'lang', 'send_/[[lang]]/site_contract/[siteId]-[contractId]': 'siteId' | 'contractId' | 'lang' }
        LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
        Params: { lang: never, id: never, siteId: never, contractId: never, rest: never, name: never, str: never, s: never, d: never }
      }
      "
    `)
  })

  it('format variables', () => {
    const generated_file_path = 'src/test/ROUTES_format5.ts'
    run({
      generated_file_path,
      format: 'variables',
      ...commonConfigFormat1,
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */

      //
      // PAGES
      //
      export const PAGES__ROOT = \`/\`
      export const PAGES_subGroup = \`/subGroup\`
      export const PAGES_subGroup2 = (params: { first: (string | number) }) => {
        return \`/subGroup2\${appendSp({ first: params?.first })}\` 
      }
      export const PAGES_lang_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }, sp?: Record<string, string | number>) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\${appendSp(sp)}\` 
      }
      export const PAGES_lang_contract_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\` 
      }
      export const PAGES_lang_gp_one = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\` 
      }
      export const PAGES_lang_gp_two = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\` 
      }
      export const PAGES_lang_main = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\` 
      }
      export const PAGES_lang_match_id_int = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\` 
      }
      export const PAGES_lang_site = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\${appendSp({ limit: params?.limit, ...sp })}\` 
      }
      export const PAGES_lang_site_id = (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
        params = params ?? {}
        params.lang = params.lang ?? \\"fr\\"; 
        params.id = params.id ?? \\"Vienna\\"; 
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\${appendSp({ limit: params?.limit, demo: params?.demo })}\` 
      }
      export const PAGES_lang_site_contract_siteId_contractId = (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\${appendSp({ limit: params?.limit })}\` 
      }
      export const PAGES_a_rest_z = (params: { rest: (string | number)[] }) => {
        return \`/a/\${params.rest?.join('/')}/z\` 
      }
      export const PAGES_lay_normal = \`/lay/normal\`
      export const PAGES_lay_root_layout = \`/lay/root-layout\`
      export const PAGES_lay_skip = \`/lay/skip\`

      //
      // SERVERS
      //
      export const SERVERS_GET_lang_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\` 
      }
      export const SERVERS_POST_lang_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\` 
      }
      export const SERVERS_GET_lang_site = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\` 
      }
      export const SERVERS_GET_api_graphql = \`/api/graphql\`
      export const SERVERS_POST_api_graphql = \`/api/graphql\`

      //
      // ACTIONS
      //
      export const ACTIONS_default_lang_contract_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\${appendSp({ limit: params?.limit })}\` 
      }
      export const ACTIONS_create_lang_site = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\` 
      }
      export const ACTIONS_update_lang_site_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\` 
      }
      export const ACTIONS_delete_lang_site_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\` 
      }
      export const ACTIONS_noSatisfies_lang_site_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\` 
      }
      export const ACTIONS_send_lang_site_contract_siteId_contractId = (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), extra?: ('A' | 'B') }) => {
        params.extra = params.extra ?? \\"A\\"; 
        return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\${appendSp({ extra: params?.extra }, '&')}\` 
      }

      //
      // LINKS
      //
      export const LINKS_twitter = \`https:/twitter.com/jycouet\`
      export const LINKS_twitter_post = (params: { name: (string | number), id: (string | number) }) => {
        return \`https:/twitter.com/\${params.name}/status/\${params.id}\` 
      }
      export const LINKS_gravatar = (params: { str: (string | number), s?: (number), d?: (\\"retro\\" | \\"identicon\\") }) => {
        params.s = params.s ?? 75; 
        params.d = params.d ?? \\"identicon\\"; 
        return \`https:/www.gravatar.com/avatar/\${params.str}\${appendSp({ s: params?.s, d: params?.d })}\` 
      }

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
        PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup2': never, 'lang_contract': 'lang', 'lang_contract_id': 'id' | 'lang', 'lang_gp_one': 'lang', 'lang_gp_two': 'lang', 'lang_main': 'lang', 'lang_match_id_int': 'id' | 'lang', 'lang_site': 'lang', 'lang_site_id': 'lang' | 'id', 'lang_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang', 'a_rest_z': 'rest', 'lay_normal': never, 'lay_root_layout': never, 'lay_skip': never }
        SERVERS: { 'GET_lang_contract': 'lang', 'POST_lang_contract': 'lang', 'GET_lang_site': 'lang', 'GET_api_graphql': never, 'POST_api_graphql': never }
        ACTIONS: { 'default_lang_contract_id': 'id' | 'lang', 'create_lang_site': 'lang', 'update_lang_site_id': 'id' | 'lang', 'delete_lang_site_id': 'id' | 'lang', 'noSatisfies_lang_site_contract': 'lang', 'send_lang_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang' }
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
      format: '_',
      path_base: true,
      ...commonConfigFormat1,
      ...commonConfig,
    })

    expect(read(generated_file_path)).toMatchInlineSnapshot(`
      "/** 
       * This file was generated by 'vite-plugin-kit-routes'
       * 
       *      >> DO NOT EDIT THIS FILE MANUALLY <<
       */
      import { base } from '$app/paths'

      export const PAGES = {
        \\"_ROOT\\": \`\${base}/\`,
        \\"subGroup\\": \`\${base}/subGroup\`,
        \\"subGroup2\\": (params: { first: (string | number) }) => {
          return \`\${base}/subGroup2\${appendSp({ first: params?.first })}\`
        },
        \\"lang_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }, sp?: Record<string, string | number>) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\${appendSp(sp)}\`
        },
        \\"lang_contract_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
        },
        \\"lang_gp_one\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
        },
        \\"lang_gp_two\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
        },
        \\"lang_main\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
        },
        \\"lang_match_id_int\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
        },
        \\"lang_site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site\${appendSp({ limit: params?.limit, ...sp })}\`
        },
        \\"lang_site_id\\": (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
          params = params ?? {}
          params.lang = params.lang ?? \\"fr\\"; 
          params.id = params.id ?? \\"Vienna\\"; 
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\${appendSp({ limit: params?.limit, demo: params?.demo })}\`
        },
        \\"lang_site_contract_siteId_contractId\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\${appendSp({ limit: params?.limit })}\`
        },
        \\"a_rest_z\\": (params: { rest: (string | number)[] }) => {
          return \`\${base}/a/\${params.rest?.join('/')}/z\`
        },
        \\"lay_normal\\": \`\${base}/lay/normal\`,
        \\"lay_root_layout\\": \`\${base}/lay/root-layout\`,
        \\"lay_skip\\": \`\${base}/lay/skip\`
      }

      export const SERVERS = {
        \\"GET_lang_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"POST_lang_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
        },
        \\"GET_lang_site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
        },
        \\"GET_api_graphql\\": \`\${base}/api/graphql\`,
        \\"POST_api_graphql\\": \`\${base}/api/graphql\`
      }

      export const ACTIONS = {
        \\"default_lang_contract_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\${appendSp({ limit: params?.limit })}\`
        },
        \\"create_lang_site\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/create\`
        },
        \\"update_lang_site_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/update\`
        },
        \\"delete_lang_site_id\\": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}?/delete\`
        },
        \\"noSatisfies_lang_site_contract\\": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract?/noSatisfies\`
        },
        \\"send_lang_site_contract_siteId_contractId\\": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), extra?: ('A' | 'B') }) => {
          params.extra = params.extra ?? \\"A\\"; 
          return \`\${base}\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/send\${appendSp({ extra: params?.extra }, '&')}\`
        }
      }

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
        PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup2': never, 'lang_contract': 'lang', 'lang_contract_id': 'id' | 'lang', 'lang_gp_one': 'lang', 'lang_gp_two': 'lang', 'lang_main': 'lang', 'lang_match_id_int': 'id' | 'lang', 'lang_site': 'lang', 'lang_site_id': 'lang' | 'id', 'lang_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang', 'a_rest_z': 'rest', 'lay_normal': never, 'lay_root_layout': never, 'lay_skip': never }
        SERVERS: { 'GET_lang_contract': 'lang', 'POST_lang_contract': 'lang', 'GET_lang_site': 'lang', 'GET_api_graphql': never, 'POST_api_graphql': never }
        ACTIONS: { 'default_lang_contract_id': 'id' | 'lang', 'create_lang_site': 'lang', 'update_lang_site_id': 'id' | 'lang', 'delete_lang_site_id': 'id' | 'lang', 'noSatisfies_lang_site_contract': 'lang', 'send_lang_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang' }
        LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
        Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, rest: never, extra: never, name: never, str: never, s: never, d: never }
      }
      "
    `)
  })
})
