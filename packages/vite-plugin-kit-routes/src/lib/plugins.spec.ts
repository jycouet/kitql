import { describe, expect, it } from 'vitest'

import { read } from './fs.js'
import { extractParamsFromPath, fileToMetadata, formatKey, run, type Options } from './plugin.js'

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
    const key = '/[[lang]]'
    const meta = fileToMetadata(key, key, 'PAGES', undefined, undefined)
    if (meta) {
      expect(meta.prop).toMatchInlineSnapshot(`
        "\\"/[[lang]]\\": (params: {lang?: string | number}= {}) =>  {
                return \`\${params?.lang ? \`/\${params?.lang}\`: '/'}\`
              }"
      `)
    } else {
      expect('I should never be').toBe('here')
    }
  })

  it('fileToMetadata optional', async () => {
    const key = '/[[lang]]/about'
    const meta = fileToMetadata(key, key, 'PAGES', undefined, undefined)
    if (meta) {
      expect(meta.prop).toMatchInlineSnapshot(`
        "\\"/[[lang]]/about\\": (params: {lang?: string | number}= {}) =>  {
                return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/about\`
              }"
      `)
    } else {
      expect('I should never be').toBe('here')
    }
  })

  it('fileToMetadata optional not at start', async () => {
    const key = '/prefix-[[lang]]/about'
    const meta = fileToMetadata(key, key, 'PAGES', undefined, undefined)
    if (meta) {
      expect(meta.prop).toMatchInlineSnapshot(`
        "\\"/prefix-[[lang]]/about\\": (params: {lang?: string | number}= {}) =>  {
                return \`/prefix-\${params?.lang ? \`\${params?.lang}\`: ''}/about\`
              }"
      `)
    } else {
      expect('I should never be').toBe('here')
    }
  })

  it('fileToMetadata default param', async () => {
    const key = '/subscriptions/[snapshot]/[id]'
    const meta = fileToMetadata(
      key,
      key,
      'PAGES',
      {
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
      undefined,
    )
    if (meta) {
      expect(meta.prop).toMatchInlineSnapshot(`
        "\\"/subscriptions/[snapshot]/[id]\\": (params: {snapshot: string | number, id: string | number}) =>  {
                return \`/subscriptions/\${params.snapshot}/\${params.id}\`
              }"
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
      mailto: 'mailto:[email]',

      // reference to link with params & search params!
      twitter_post: {
        href: 'https://twitter.com/[name]/status/[id]',
        explicit_search_params: { limit: { type: 'number' } },
      },
    },
    override_params: {
      lang: { type: "'fr' | 'en' | 'hu' | 'at' | string" },
    },
  }

  it('style _', () => {
    const generated_file_path = 'src/lib/test/ROUTES_test1.ts'
    run({
      generated_file_path,
      object_keys_format: '_',
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
          // extra_search_params: 'with',
          explicit_search_params: { limit: { type: 'number' } },
          params: {
            // yop: { type: 'number' },
          },
          extra_search_params: 'with',
        },
        lang_site_id: {
          explicit_search_params: { limit: { type: 'number' }, demo: { type: 'string' } },
          params: {
            id: { type: 'string', default: '7' },
            lang: { type: "'fr' | 'hu' | undefined", default: 'fr' },
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
        lang_site_contract_siteId_contractId: {
          explicit_search_params: {
            extra: { type: "'A' | 'B'", default: 'A' },
          },
        },
      },
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
        \\"subGroup2\\": (params: {first: string | number}) =>  {
              return \`/subGroup2\${appendSp({ first: params.first })}\`
            },
        \\"lang_contract\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}, sp?: Record<string, string | number>) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\${appendSp(sp)}\`
            },
        \\"lang_contract_id\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, id: string | number}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
            },
        \\"lang_gp_one\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
            },
        \\"lang_gp_two\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
            },
        \\"lang_main\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
            },
        \\"lang_match_id_int\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, id: string | number}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
            },
        \\"lang_site\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, limit?: number}= {}, sp?: Record<string, string | number>) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\${appendSp({...sp, limit: params.limit })}\`
            },
        \\"lang_site_id\\": (params: {lang?: 'fr' | 'hu' | undefined, id?: string, limit?: number, demo?: string}= {}) =>  {
          params.lang = params.lang ?? 'fr'; 
          params.id = params.id ?? '7'; 
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\${appendSp({ limit: params.limit, demo: params.demo })}\`
            },
        \\"lang_site_contract_siteId_contractId\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, siteId: string | number, contractId: string | number, limit?: number}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\${appendSp({ limit: params.limit })}\`
            }
      }

      export const SERVERS = {
        \\"lang_contract\\": (method: 'GET' | 'POST', params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
            },
        \\"lang_site\\": (method: 'GET', params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
            },
        \\"api_graphql\\": (method: 'GET' | 'POST') =>  {
              return \`/api/graphql\`
            }
      }

      export const ACTIONS = {
        \\"lang_contract_id\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, id: string | number}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
            },
        \\"lang_site\\": (action: 'action1' | 'action2', params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/\${action}\`
            },
        \\"lang_site_contract_siteId_contractId\\": (action: 'sendSomething', params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, siteId: string | number, contractId: string | number, extra?: 'A' | 'B'}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/\${action}\${appendSp({ extra: params.extra })}\`
            }
      }

      export const LINKS = {
        \\"twitter\\": \`https:/twitter.com/jycouet\`,
        \\"mailto\\": (params: {email: string | number}) =>  {
              return \`mailto:\${params.email}\`
            },
        \\"twitter_post\\": (params: {name: string | number, id: string | number, limit?: number}) =>  {
              return \`https:/twitter.com/\${params.name}/status/\${params.id}\${appendSp({ limit: params.limit })}\`
            }
      }

      const appendSp = (sp?: Record<string, string | number | undefined>) => {
        if (sp === undefined) return ''
        const mapping = Object.entries(sp)
          .filter(c => c[1] !== undefined)
          .map(c => [c[0], String(c[1])])

        const formated = new URLSearchParams(mapping).toString()
        if (formated) {
          return \`?\${formated}\`
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
      *    // here, \\"paths\\" it will be typed!
      *  }
      * })
      * \`\`\`
      */
      export type KIT_ROUTES = { 
        PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup2': 'first', 'lang_contract': 'lang', 'lang_contract_id': 'lang' | 'id', 'lang_gp_one': 'lang', 'lang_gp_two': 'lang', 'lang_main': 'lang', 'lang_match_id_int': 'lang' | 'id', 'lang_site': 'lang' | 'limit', 'lang_site_id': 'lang' | 'id' | 'limit' | 'demo', 'lang_site_contract_siteId_contractId': 'lang' | 'siteId' | 'contractId' | 'limit' }
        SERVERS: { 'lang_contract': 'lang', 'lang_site': 'lang', 'api_graphql': never }
        ACTIONS: { 'lang_contract_id': 'lang' | 'id', 'lang_site': 'lang', 'lang_site_contract_siteId_contractId': 'lang' | 'siteId' | 'contractId' | 'extra' }
        LINKS: { 'twitter': never, 'mailto': 'email', 'twitter_post': 'name' | 'id' | 'limit' }
        Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, extra: never, email: never, name: never }
      }
      "
    `)
  })

  it('style /', () => {
    const generated_file_path = 'src/lib/test/ROUTES_test2.ts'
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
        \\"/[[lang]]/contract\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
            },
        \\"/[[lang]]/contract/[id]\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, id: string | number}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
            },
        \\"/[[lang]]/gp/one\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/one\`
            },
        \\"/[[lang]]/gp/two\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/gp/two\`
            },
        \\"/[[lang]]/main\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/main\`
            },
        \\"/[[lang]]/match/[id=int]\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, id: string | number}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/match/\${params.id}\`
            },
        \\"/[[lang]]/site\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
            },
        \\"/[[lang]]/site/[id]\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, id: string | number}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site/\${params.id}\`
            },
        \\"/[[lang]]/site_contract/[siteId]-[contractId]\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, siteId: string | number, contractId: string | number}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}\`
            }
      }

      export const SERVERS = {
        \\"/[[lang]]/contract\\": (method: 'GET' | 'POST', params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract\`
            },
        \\"/[[lang]]/site\\": (method: 'GET', params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site\`
            },
        \\"/api/graphql\\": (method: 'GET' | 'POST') =>  {
              return \`/api/graphql\`
            }
      }

      export const ACTIONS = {
        \\"/[[lang]]/contract/[id]\\": (params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, id: string | number}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/contract/\${params.id}\`
            },
        \\"/[[lang]]/site\\": (action: 'action1' | 'action2', params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string}= {}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site?/\${action}\`
            },
        \\"/[[lang]]/site_contract/[siteId]-[contractId]\\": (action: 'sendSomething', params: {lang?: 'fr' | 'en' | 'hu' | 'at' | string, siteId: string | number, contractId: string | number}) =>  {
              return \`\${params?.lang ? \`/\${params?.lang}\`: ''}/site_contract/\${params.siteId}-\${params.contractId}?/\${action}\`
            }
      }

      export const LINKS = {
        \\"twitter\\": \`https:/twitter.com/jycouet\`,
        \\"mailto\\": (params: {email: string | number}) =>  {
              return \`mailto:\${params.email}\`
            },
        \\"twitter_post\\": (params: {name: string | number, id: string | number, limit?: number}) =>  {
              return \`https:/twitter.com/\${params.name}/status/\${params.id}\${appendSp({ limit: params.limit })}\`
            }
      }

      const appendSp = (sp?: Record<string, string | number | undefined>) => {
        if (sp === undefined) return ''
        const mapping = Object.entries(sp)
          .filter(c => c[1] !== undefined)
          .map(c => [c[0], String(c[1])])

        const formated = new URLSearchParams(mapping).toString()
        if (formated) {
          return \`?\${formated}\`
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
      *    // here, \\"paths\\" it will be typed!
      *  }
      * })
      * \`\`\`
      */
      export type KIT_ROUTES = { 
        PAGES: { '/': never, '/subGroup': never, '/subGroup2': never, '/[[lang]]/contract': 'lang', '/[[lang]]/contract/[id]': 'lang' | 'id', '/[[lang]]/gp/one': 'lang', '/[[lang]]/gp/two': 'lang', '/[[lang]]/main': 'lang', '/[[lang]]/match/[id=int]': 'lang' | 'id', '/[[lang]]/site': 'lang', '/[[lang]]/site/[id]': 'lang' | 'id', '/[[lang]]/site_contract/[siteId]-[contractId]': 'lang' | 'siteId' | 'contractId' }
        SERVERS: { '/[[lang]]/contract': 'lang', '/[[lang]]/site': 'lang', '/api/graphql': never }
        ACTIONS: { '/[[lang]]/contract/[id]': 'lang' | 'id', '/[[lang]]/site': 'lang', '/[[lang]]/site_contract/[siteId]-[contractId]': 'lang' | 'siteId' | 'contractId' }
        LINKS: { 'twitter': never, 'mailto': 'email', 'twitter_post': 'name' | 'id' | 'limit' }
        Params: { lang: never, id: never, siteId: never, contractId: never, email: never, name: never, limit: never }
      }
      "
    `)
  })

  it('post_update_run', () => {
    const generated_file_path = 'src/lib/test/ROUTES_test3.ts'
    run({
      generated_file_path,
      post_update_run: 'echo done',
    })
  })
})
