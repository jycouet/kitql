import { describe, expect, it } from 'vitest'

import { getFilesUnder, read } from '@kitql/internals'

import type { KIT_ROUTES as KIT_ROUTES_ObjectPath } from '../test/ROUTES_format-object-path.js'
import type { KIT_ROUTES as KIT_ROUTES_ObjectSymbol } from '../test/ROUTES_format-object-symbol.js'
import type { KIT_ROUTES as KIT_ROUTES_RoutePathPageRouteId } from '../test/ROUTES_format-route-path-page-route-id.js'
import type { KIT_ROUTES as KIT_ROUTES_RouteSymbol } from '../test/ROUTES_format-route-symbol.js'
import {
	extractParamsFromPath,
	formatKey,
	rmvGroups,
	rmvOptional,
	routes_path,
	run,
	transformToMetadata,
	type KindOfObject,
	type Options,
} from './plugin.js'

describe('extractParamsFromPath', () => {
	it('get id', async () => {
		expect(extractParamsFromPath('/site/[id]', {})).toMatchInlineSnapshot(`
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
		expect(extractParamsFromPath('/site/[param]/[id]', {})).toMatchInlineSnapshot(`
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
		expect(extractParamsFromPath('/[param]site/[yop](group)/[id]', {})).toMatchInlineSnapshot(`
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
		expect(extractParamsFromPath('/lang/[[lang]]', {})).toMatchInlineSnapshot(`
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

	it('get matcher simple', async () => {
		expect(extractParamsFromPath('/[tmp=ab]', {})).toMatchInlineSnapshot(`
      [
        {
          "fromPath": true,
          "isArray": false,
          "matcher": "ab",
          "name": "tmp",
          "needExtractParamType": true,
          "optional": false,
          "type": "ExtractParamType<typeof import('../params/ab.ts').match>",
        },
      ]
    `)
	})

	it('get matcher custom path', async () => {
		expect(
			extractParamsFromPath('/[tmp=ab]', {
				path_params: 'src/my/custom/path',
				generated_file_path: './src/lib/dep/routes.ts',
			}),
		).toMatchInlineSnapshot(`
      [
        {
          "fromPath": true,
          "isArray": false,
          "matcher": "ab",
          "name": "tmp",
          "needExtractParamType": true,
          "optional": false,
          "type": "ExtractParamType<typeof import('../../my/custom/path/ab.ts').match>",
        },
      ]
    `)
	})
})

describe('formatKey', () => {
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
})

describe('fileToMetadata', () => {
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
            "strReturn": "\`\${params?.['lang'] ? \`/\${params?.['lang']}\`: '/'}\`",
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
            "strReturn": "\`\${params?.['lang'] ? \`/\${params?.['lang']}\`: ''}/about\`",
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
            "strReturn": "\`/prefix-\${params?.['lang'] ? \`\${params?.['lang']}\`: ''}/about\`",
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
							snapshot: { type: 'string', default: 'snapshot' },
							id: { type: 'string', default: 'id' },
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
            "strReturn": "\`/subscriptions/\${params['snapshot']}/\${params['id']}\`",
          },
        ]
      `)
		} else {
			expect('I should never be').toBe('here')
		}
	})
})

describe('getFilesUnder', () => {
	it('Looking at another path (lib)', async () => {
		const location = routes_path('/src/lib')
		expect(getFilesUnder(location)).toMatchInlineSnapshot(`
			[
			  "ROUTES.ts",
			  "ast.spec.ts",
			  "ast.ts",
			  "bin.spec.ts",
			  "bin.ts",
			  "format.ts",
			  "index.ts",
			  "plugin.ts",
			  "plugins.spec.ts",
			]
		`)
	})

	it('Looking at another path (routes/api)', async () => {
		const location = routes_path('/src/routes/api')
		expect(getFilesUnder(location)).toMatchInlineSnapshot(`
      [
        "graphql/+server.ts",
      ]
    `)
	})

	it('rmvOptional', async () => {
		const location = routes_path()
		expect(getFilesUnder(location).map((c) => rmvOptional(c))).toMatchInlineSnapshot(`
			[
			  "(rootGroup)/+page.svelte",
			  "(rootGroup)/base/(group-optional)/+page.svelte",
			  "(rootGroup)/base/+page.svelte",
			  "(rootGroup)/subGroup/(anotherSub)/user/+page.svelte",
			  "(rootGroup)/subGroup/+page.svelte",
			  "(rootGroup)/subGroup2/+page.svelte",
			  "(servers)/server_func_get/+server.ts",
			  "(servers)/server_func_get_and_/+server.ts",
			  "(servers)/server_func_post/+server.ts",
			  "+layout.svelte",
			  "/contract/+page.svelte",
			  "/contract/+server.ts",
			  "/contract/[id]/+page.server.ts",
			  "/contract/[id]/+page.svelte",
			  "/gp/(logged)/one/+page.svelte",
			  "/gp/(public)/two/+page.svelte",
			  "/main/+page.svelte",
			  "/match/[id=ab]/+page.svelte",
			  "/match/[id=int]/+page.svelte",
			  "/site/+page.server.ts",
			  "/site/+page.svelte",
			  "/site/+server.ts",
			  "/site/[id]/+page.server.ts",
			  "/site/[id]/+page.svelte",
			  "/site_contract/+page.server.ts",
			  "/site_contract/[siteId]-[contractId]/+page.server.ts",
			  "/site_contract/[siteId]-[contractId]/+page.svelte",
			  "[u+d83e][u+dd2a]/+page.svelte",
			  "[u+d83e][u+dd2a]/[emoji]/[u+2b50]/+page.svelte",
			  "[x+2e]well-known/+page.svelte",
			  "[x+2e]well-known/+server.ts",
			  "a/[...rest]/z/+page.svelte",
			  "anchors/+page.svelte",
			  "anchors/[id]/+page.svelte",
			  "api/graphql/+server.ts",
			  "data/errors/[locale].json/+server.ts",
			  "lay/(layVerySpecial)/+layout.svelte",
			  "lay/(layVerySpecial)/normal/+page.svelte",
			  "lay/(layVerySpecial)/root-layout/+page@.svelte",
			  "lay/(layVerySpecial)/skip/+page@lay.svelte",
			  "lay/+layout.svelte",
			  "md/+page.md",
			  "mdsvex/+page.mdsvex",
			  "page_server_woAction/+page.server.ts",
			  "sp/+page.svelte",
			  "spArray/+page.svelte",
			  "spArrayComma/+page.svelte",
			]
		`)
	})

	it('rmvGroups with multi groups', async () => {
		expect(rmvGroups('/(rootGroup)/subGroup/(anotherSub)/user')).toBe('/subGroup/user')
	})

	it('rmvGroups', async () => {
		const location = routes_path()
		expect(getFilesUnder(location)).toMatchInlineSnapshot(`
			[
			  "(rootGroup)/+page.svelte",
			  "(rootGroup)/base/(group-optional)/[[all]]/+page.svelte",
			  "(rootGroup)/base/+page.svelte",
			  "(rootGroup)/subGroup/(anotherSub)/user/+page.svelte",
			  "(rootGroup)/subGroup/+page.svelte",
			  "(rootGroup)/subGroup2/+page.svelte",
			  "(servers)/server_func_get/+server.ts",
			  "(servers)/server_func_get_and_/+server.ts",
			  "(servers)/server_func_post/+server.ts",
			  "+layout.svelte",
			  "[[lang]]/contract/+page.svelte",
			  "[[lang]]/contract/+server.ts",
			  "[[lang]]/contract/[id]/+page.server.ts",
			  "[[lang]]/contract/[id]/+page.svelte",
			  "[[lang]]/gp/(logged)/one/+page.svelte",
			  "[[lang]]/gp/(public)/two/+page.svelte",
			  "[[lang]]/main/+page.svelte",
			  "[[lang]]/match/[id=ab]/+page.svelte",
			  "[[lang]]/match/[id=int]/+page.svelte",
			  "[[lang]]/site/+page.server.ts",
			  "[[lang]]/site/+page.svelte",
			  "[[lang]]/site/+server.ts",
			  "[[lang]]/site/[id]/+page.server.ts",
			  "[[lang]]/site/[id]/+page.svelte",
			  "[[lang]]/site_contract/+page.server.ts",
			  "[[lang]]/site_contract/[siteId]-[contractId]/+page.server.ts",
			  "[[lang]]/site_contract/[siteId]-[contractId]/+page.svelte",
			  "[u+d83e][u+dd2a]/+page.svelte",
			  "[u+d83e][u+dd2a]/[emoji]/[u+2b50]/+page.svelte",
			  "[x+2e]well-known/+page.svelte",
			  "[x+2e]well-known/+server.ts",
			  "a/[...rest]/z/+page.svelte",
			  "anchors/+page.svelte",
			  "anchors/[id]/+page.svelte",
			  "api/graphql/+server.ts",
			  "data/errors/[locale].json/+server.ts",
			  "lay/(layVerySpecial)/+layout.svelte",
			  "lay/(layVerySpecial)/normal/+page.svelte",
			  "lay/(layVerySpecial)/root-layout/+page@.svelte",
			  "lay/(layVerySpecial)/skip/+page@lay.svelte",
			  "lay/+layout.svelte",
			  "md/+page.md",
			  "mdsvex/+page.mdsvex",
			  "page_server_woAction/+page.server.ts",
			  "sp/+page.svelte",
			  "spArray/+page.svelte",
			  "spArrayComma/+page.svelte",
			]
		`)

		expect(getFilesUnder(location).map((c) => rmvGroups(c))).toMatchInlineSnapshot(`
			[
			  "/+page.svelte",
			  "/base/[[all]]/+page.svelte",
			  "/base/+page.svelte",
			  "/subGroup/user/+page.svelte",
			  "/subGroup/+page.svelte",
			  "/subGroup2/+page.svelte",
			  "/server_func_get/+server.ts",
			  "/server_func_get_and_/+server.ts",
			  "/server_func_post/+server.ts",
			  "+layout.svelte",
			  "[[lang]]/contract/+page.svelte",
			  "[[lang]]/contract/+server.ts",
			  "[[lang]]/contract/[id]/+page.server.ts",
			  "[[lang]]/contract/[id]/+page.svelte",
			  "[[lang]]/gp/one/+page.svelte",
			  "[[lang]]/gp/two/+page.svelte",
			  "[[lang]]/main/+page.svelte",
			  "[[lang]]/match/[id=ab]/+page.svelte",
			  "[[lang]]/match/[id=int]/+page.svelte",
			  "[[lang]]/site/+page.server.ts",
			  "[[lang]]/site/+page.svelte",
			  "[[lang]]/site/+server.ts",
			  "[[lang]]/site/[id]/+page.server.ts",
			  "[[lang]]/site/[id]/+page.svelte",
			  "[[lang]]/site_contract/+page.server.ts",
			  "[[lang]]/site_contract/[siteId]-[contractId]/+page.server.ts",
			  "[[lang]]/site_contract/[siteId]-[contractId]/+page.svelte",
			  "[u+d83e][u+dd2a]/+page.svelte",
			  "[u+d83e][u+dd2a]/[emoji]/[u+2b50]/+page.svelte",
			  "[x+2e]well-known/+page.svelte",
			  "[x+2e]well-known/+server.ts",
			  "a/[...rest]/z/+page.svelte",
			  "anchors/+page.svelte",
			  "anchors/[id]/+page.svelte",
			  "api/graphql/+server.ts",
			  "data/errors/[locale].json/+server.ts",
			  "lay/+layout.svelte",
			  "lay/normal/+page.svelte",
			  "lay/root-layout/+page@.svelte",
			  "lay/skip/+page@lay.svelte",
			  "lay/+layout.svelte",
			  "md/+page.md",
			  "mdsvex/+page.mdsvex",
			  "page_server_woAction/+page.server.ts",
			  "sp/+page.svelte",
			  "spArray/+page.svelte",
			  "spArrayComma/+page.svelte",
			]
		`)
	})

	it('rmvGroups & Optional', async () => {
		const location = routes_path()
		expect(getFilesUnder(location).map((c) => rmvGroups(rmvOptional(c)))).toMatchInlineSnapshot(`
			[
			  "/+page.svelte",
			  "/base/+page.svelte",
			  "/base/+page.svelte",
			  "/subGroup/user/+page.svelte",
			  "/subGroup/+page.svelte",
			  "/subGroup2/+page.svelte",
			  "/server_func_get/+server.ts",
			  "/server_func_get_and_/+server.ts",
			  "/server_func_post/+server.ts",
			  "+layout.svelte",
			  "/contract/+page.svelte",
			  "/contract/+server.ts",
			  "/contract/[id]/+page.server.ts",
			  "/contract/[id]/+page.svelte",
			  "/gp/one/+page.svelte",
			  "/gp/two/+page.svelte",
			  "/main/+page.svelte",
			  "/match/[id=ab]/+page.svelte",
			  "/match/[id=int]/+page.svelte",
			  "/site/+page.server.ts",
			  "/site/+page.svelte",
			  "/site/+server.ts",
			  "/site/[id]/+page.server.ts",
			  "/site/[id]/+page.svelte",
			  "/site_contract/+page.server.ts",
			  "/site_contract/[siteId]-[contractId]/+page.server.ts",
			  "/site_contract/[siteId]-[contractId]/+page.svelte",
			  "[u+d83e][u+dd2a]/+page.svelte",
			  "[u+d83e][u+dd2a]/[emoji]/[u+2b50]/+page.svelte",
			  "[x+2e]well-known/+page.svelte",
			  "[x+2e]well-known/+server.ts",
			  "a/[...rest]/z/+page.svelte",
			  "anchors/+page.svelte",
			  "anchors/[id]/+page.svelte",
			  "api/graphql/+server.ts",
			  "data/errors/[locale].json/+server.ts",
			  "lay/+layout.svelte",
			  "lay/normal/+page.svelte",
			  "lay/root-layout/+page@.svelte",
			  "lay/skip/+page@lay.svelte",
			  "lay/+layout.svelte",
			  "md/+page.md",
			  "mdsvex/+page.mdsvex",
			  "page_server_woAction/+page.server.ts",
			  "sp/+page.svelte",
			  "spArray/+page.svelte",
			  "spArrayComma/+page.svelte",
			]
		`)
	})
})

describe('run()', async () => {
	const commonConfig: Options = {
		LINKS: {
			// reference to a hardcoded link
			bluesky: 'https://bsky.app/profile/jyc.dev',

			// reference to link with params!
			bluesky_post: 'https://bsky.app/profile/[did]/post/[post_id]',

			// reference to link with params & search params!
			gravatar: {
				href: 'https://www.gravatar.com/avatar/[str]',
				explicit_search_params: {
					s: { type: 'number', default: 75 },
					d: { type: '"retro" | "identicon"', default: 'identicon' },
				},
			},
		},
		override_params: {
			lang: { type: "'fr' | 'en' | 'hu' | 'at' | string" },
		},
	}

	const commonConfig_variables: Options<KIT_ROUTES_ObjectSymbol> = {
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
				explicit_search_params: {
					limit: { type: 'number' },
					demo: { type: 'string' },
					'da-sh': { type: 'string' },
				},
				params: {
					id: { type: 'string', default: 'Vienna' },
					lang: { type: "'fr' | 'hu' | undefined", default: 'fr' },
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
			spArray: {
				explicit_search_params: { ids: { type: 'number[]', required: true } },
			},
			spArrayComma: {
				explicit_search_params: { ids: { type: 'number[]', required: true, arrayMode: 'join' } },
			},
			anchors: {
				explicit_search_params: {
					// anotherOne: {
					//   type: 'string',
					// },
				},
				hash: {
					type: '"section0" | "section1" | "section2" | "section3"',
					required: true,
				},
			},
			anchors_id: {
				hash: { type: '"section0" | "section1" | "section2" | "section3"', required: true },
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
					extra: { type: "'A' | 'B'", default: 'A' },
				},
			},
		},
	}

	const commonConfig_Path: Options<KIT_ROUTES_ObjectPath> = {
		PAGES: {
			'/subGroup2': commonConfig_variables.PAGES?.subGroup2,
			'/contract': commonConfig_variables.PAGES?.contract,
			'/site': commonConfig_variables.PAGES?.site,
			'/site/[id]': commonConfig_variables.PAGES?.site_id,
			'/match/[id=int]': commonConfig_variables.PAGES?.match_id_int,
			'/site_contract/[siteId]-[contractId]':
				commonConfig_variables.PAGES?.site_contract_siteId_contractId,
			'/anchors': commonConfig_variables.PAGES?.anchors,
			'/anchors/[id]': commonConfig_variables.PAGES?.anchors_id,
		},
		SERVERS: {},
		ACTIONS: {
			'default /contract/[id]': commonConfig_variables.ACTIONS?.default_contract_id,
			'send /site_contract/[siteId]-[contractId]':
				commonConfig_variables.ACTIONS?.send_site_contract_siteId_contractId,
		},
	}

	const commonConfig_Path_PageRouteId: Options<KIT_ROUTES_RoutePathPageRouteId> = {
		PAGES: {
			'/(rootGroup)/subGroup2': commonConfig_variables.PAGES?.subGroup2,
			'/[[lang]]/contract': commonConfig_variables.PAGES?.contract,
			'/[[lang]]/site': commonConfig_variables.PAGES?.site,
			'/[[lang]]/site/[id]': commonConfig_variables.PAGES?.site_id,
			'/[[lang]]/match/[id=int]': commonConfig_variables.PAGES?.match_id_int,
			'/[[lang]]/site_contract/[siteId]-[contractId]':
				commonConfig_variables.PAGES?.site_contract_siteId_contractId,
			'/anchors': commonConfig_variables.PAGES?.anchors,
			'/anchors/[id]': commonConfig_variables.PAGES?.anchors_id,
		},
		SERVERS: {},
		ACTIONS: {
			'default /[[lang]]/contract/[id]': commonConfig_variables.ACTIONS?.default_contract_id,
			'send /[[lang]]/site_contract/[siteId]-[contractId]':
				commonConfig_variables.ACTIONS?.send_site_contract_siteId_contractId,
		},
	}

	const commonConfig_symbol: Options<KIT_ROUTES_RouteSymbol> = {
		PAGES: {
			subGroup2: commonConfig_variables.PAGES?.subGroup2,
			contract: commonConfig_variables.PAGES?.contract,
			site: commonConfig_variables.PAGES?.site,
			site_id: commonConfig_variables.PAGES?.site_id,
			match_id_int: commonConfig_variables.PAGES?.match_id_int,
			site_contract_siteId_contractId: commonConfig_variables.PAGES?.site_contract_siteId_contractId,
			anchors: commonConfig_variables.PAGES?.anchors,
			anchors_id: commonConfig_variables.PAGES?.anchors_id,
		},
		SERVERS: {},
		ACTIONS: {
			'default contract_id': commonConfig_variables.ACTIONS?.default_contract_id,
			'send site_contract_siteId_contractId':
				commonConfig_variables.ACTIONS?.send_site_contract_siteId_contractId,
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
			extra: { ...commonConfig, ...commonConfig_variables },
		},
		// this is the default
		{
			pathFile: 'format-route-path',
			format: 'route(path)',
			extra: { ...commonConfig, ...commonConfig_Path },
		},
		{
			pathFile: 'format-route-symbol',
			format: 'route(symbol)',
			extra: { ...commonConfig, ...commonConfig_symbol },
		},
		{
			pathFile: 'format-variables',
			format: 'variables',
			extra: { ...commonConfig, ...commonConfig_variables },
		},
		{
			pathFile: 'format-route-and-object-path',
			format: 'route(path) & object[path]',
			extra: { ...commonConfig, ...commonConfig_Path },
		},
		{
			pathFile: 'format-route-and-object-symbol',
			format: 'route(symbol) & object[symbol]',
			extra: { ...commonConfig, ...commonConfig_symbol },
		},
		{
			pathFile: 'format-route-path-page-route-id',
			format: 'route(path)',
			extra: { ...commonConfig, ...commonConfig_Path_PageRouteId, format_page_route_id: true },
		},
	] as const

	// First time
	for (let i = 0; i < runs.length; i++) {
		const toRun = runs[i]
		it(`run ${toRun.pathFile}`, async () => {
			const generated_file_path = getPathROUTES(toRun.pathFile)

			const ret = await run(false, {
				format: toRun.format,
				generated_file_path,
				...toRun.extra,
			})

			expect(ret).toBe(true)
		})
	}
	// Second time shortened
	for (let i = 0; i < runs.length; i++) {
		const toRun = getToRunShortened(runs[i])

		it(`run ${toRun.pathFile}`, async () => {
			const ret = await run(false, {
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
	const table = [
		{
			name: 'ROOT, return is not a function',
			kind: 'PAGES',
			results: '/',
			key_path: '/',
			key_path_routeId: '/(rootGroup)',
			key_symbol: '_ROOT',
			params: [],
			params_shortened: [],
		},
		{
			name: 'single param (required)',
			kind: 'PAGES',
			results: '/contract/abc',
			key_path: '/contract/[id]',
			key_path_routeId: '/[[lang]]/contract/[id]',
			key_symbol: 'contract_id',
			params: [{ id: 'abc' }],
			params_shortened: ['abc'],
		},
		{
			name: 'single param (with default)',
			kind: 'PAGES',
			results: '/fr/site/Paris',
			key_path: '/site/[id]',
			key_path_routeId: '/[[lang]]/site/[id]',
			key_symbol: 'site_id',
			params: [{ id: 'Paris' }],
			params_shortened: [{ id: 'Paris' }],
		},
		{
			name: 'only optional',
			kind: 'PAGES',
			results: '/main',
			key_path: '/main',
			key_path_routeId: '/[[lang]]/main',
			key_symbol: 'main',
			params: [],
			params_shortened: [],
		},
		{
			name: 'with search params',
			kind: 'PAGES',
			results: '/contract?yop=hello',
			key_path: '/contract',
			key_path_routeId: '/[[lang]]/contract',
			key_symbol: 'contract',
			params: [{}, { yop: 'hello' }],
			params_shortened: [{}, { yop: 'hello' }],
		},
		{
			name: 'multi params',
			kind: 'PAGES',
			results: '/fr/site_contract/Paris-abc?limit=2',
			key_path: '/site_contract/[siteId]-[contractId]',
			key_path_routeId: '/[[lang]]/site_contract/[siteId]-[contractId]',
			key_symbol: 'site_contract_siteId_contractId',
			params: [{ siteId: 'Paris', contractId: 'abc', limit: 2, lang: 'fr' }],
			params_shortened: [{ siteId: 'Paris', contractId: 'abc', limit: 2, lang: 'fr' }],
		},
		{
			name: 'direct link',
			kind: 'LINKS',
			results: 'https://bsky.app/profile/jyc.dev',
			key_path: 'bluesky',
			key_path_routeId: 'bluesky',
			key_symbol: 'bluesky',
			params: [],
			params_shortened: [],
		},
		{
			name: 'nested groups',
			kind: 'PAGES',
			results: '/subGroup/user',
			key_path: '/subGroup/user',
			key_path_routeId: '/(rootGroup)/subGroup/(anotherSub)/user',
			key_symbol: 'subGroup_user',
			params: [],
			params_shortened: [],
		},
	] as const

	for (let i = 0; i < table.length; i++) {
		const element = table[i]
		describe(element.name, async () => {
			//
			it('format object[path]', async () => {
				const { PAGES, SERVERS, ACTIONS, LINKS } = await import(getPathROUTES(runs[0].pathFile))
				const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)
				expect(fnOrNot(obj, element.key_path, ...element.params), element.name).toBe(element.results)
			})
			// SHORTENED
			it('format object[path] shortened', async () => {
				const { PAGES, SERVERS, ACTIONS, LINKS } = await import(
					getPathROUTES(getToRunShortened(runs[0]).pathFile)
				)
				const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)
				expect(fnOrNot(obj, element.key_path, ...element.params_shortened), element.name).toBe(
					element.results,
				)
			})

			//
			it('format object[symbol]', async () => {
				const { PAGES, SERVERS, ACTIONS, LINKS } = await import(getPathROUTES(runs[1].pathFile))
				const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)
				expect(fnOrNot(obj, element.key_symbol, ...element.params), element.name).toBe(element.results)
			})
			// SHORTENED
			it('format object[symbol] shortened', async () => {
				const { PAGES, SERVERS, ACTIONS, LINKS } = await import(
					getPathROUTES(getToRunShortened(runs[1]).pathFile)
				)
				const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)
				expect(fnOrNot(obj, element.key_symbol, ...element.params_shortened), element.name).toBe(
					element.results,
				)
			})

			//
			it('format route(path)', async () => {
				const { route } = await import(getPathROUTES(runs[2].pathFile))
				expect(route(element.key_path, ...element.params), element.name).toBe(element.results)
			})
			// SHORTENED
			it('format route(path) shortened', async () => {
				const { route } = await import(getPathROUTES(getToRunShortened(runs[2]).pathFile))
				expect(route(element.key_path, ...element.params_shortened), element.name).toBe(element.results)
			})

			//
			it('format route(symbol)', async () => {
				const { route } = await import(getPathROUTES(runs[3].pathFile))
				expect(route(element.key_symbol, ...element.params), element.name).toBe(element.results)
			})
			// SHORTENED
			it('format route(symbol) shortened', async () => {
				const { route } = await import(getPathROUTES(getToRunShortened(runs[3]).pathFile))
				expect(route(element.key_symbol, ...element.params_shortened), element.name).toBe(
					element.results,
				)
			})

			//
			it('format route(path) & object[path]', async () => {
				const { route, PAGES, SERVERS, ACTIONS, LINKS } = await import(getPathROUTES(runs[5].pathFile))
				// route
				expect(route(element.key_path, ...element.params), element.name).toBe(element.results)
				const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)

				// object
				expect(fnOrNot(obj, element.key_path, ...element.params), element.name).toBe(element.results)
			})
			// SHORTENED
			it('format route(path) & object[path] shortened', async () => {
				const { route, PAGES, SERVERS, ACTIONS, LINKS } = await import(
					getPathROUTES(getToRunShortened(runs[5]).pathFile)
				)
				// route
				expect(route(element.key_path, ...element.params_shortened), element.name).toBe(element.results)
				// object
				const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)
				expect(fnOrNot(obj, element.key_path, ...element.params_shortened), element.name).toBe(
					element.results,
				)
			})

			//
			it('format route(symbol) & object[symbol]', async () => {
				const { route, PAGES, SERVERS, ACTIONS, LINKS } = await import(getPathROUTES(runs[6].pathFile))
				// route
				expect(route(element.key_symbol, ...element.params), element.name).toBe(element.results)
				const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)

				// object
				expect(fnOrNot(obj, element.key_symbol, ...element.params), element.name).toBe(element.results)
			})
			// SHORTENED
			it('format route(symbol) & object[symbol] shortened', async () => {
				const { route, PAGES, SERVERS, ACTIONS, LINKS } = await import(
					getPathROUTES(getToRunShortened(runs[6]).pathFile)
				)
				// route
				expect(route(element.key_symbol, ...element.params_shortened), element.name).toBe(
					element.results,
				)

				// object
				const obj = findObj(element.kind, PAGES, SERVERS, ACTIONS, LINKS)
				expect(fnOrNot(obj, element.key_symbol, ...element.params_shortened), element.name).toBe(
					element.results,
				)
			})

			//
			it('format route(path) & route_id', async () => {
				const { route } = await import(getPathROUTES(runs[7].pathFile))
				expect(route(element.key_path_routeId, ...element.params), element.name).toBe(element.results)
			})
			// SHORTENED
			it('format route(path) & route_id shortened', async () => {
				const { route } = await import(getPathROUTES(getToRunShortened(runs[7]).pathFile))
				expect(route(element.key_path_routeId, ...element.params_shortened), element.name).toBe(
					element.results,
				)
			})

			// VARIABLES && SHORTENED
			it('format variables', async () => {
				const vars___not = await import(getPathROUTES(runs[4].pathFile))
				const vars_short = await import(getPathROUTES(getToRunShortened(runs[4]).pathFile))

				if (element.name === 'ROOT, return is not a function') {
					expect(vars___not.PAGE__ROOT, element.name).toBe(element.results)
					expect(vars_short.PAGE__ROOT, element.name).toBe(element.results)
				}
				//
				else if (element.name === 'single param (required)') {
					expect(vars___not.PAGE_contract_id({ id: 'abc' }), element.name).toBe(element.results)
					expect(vars_short.PAGE_contract_id('abc'), element.name).toBe(element.results)
				}
				//
				else if (element.name === 'single param (with default)') {
					expect(vars___not.PAGE_site_id({ id: 'Paris' }), element.name).toBe(element.results)
					expect(vars_short.PAGE_site_id({ id: 'Paris' }), element.name).toBe(element.results)
				}
				//
				else if (element.name === 'only optional') {
					expect(vars___not.PAGE_main(), element.name).toBe(element.results)
					expect(vars_short.PAGE_main(), element.name).toBe(element.results)
				}
				//
				else if (element.name === 'with search params') {
					expect(vars___not.PAGE_contract({}, { yop: 'hello' }), element.name).toBe(element.results)
					expect(vars_short.PAGE_contract({}, { yop: 'hello' }), element.name).toBe(element.results)
				}
				//
				else if (element.name === 'direct link') {
					expect(vars___not.LINK_bluesky, element.name).toBe(element.results)
					expect(vars_short.LINK_bluesky, element.name).toBe(element.results)
				}
				//
				else if (element.name === 'multi params') {
					expect(vars___not.PAGE_site_contract_siteId_contractId(...element.params), element.name).toBe(
						element.results,
					)
					expect(
						vars_short.PAGE_site_contract_siteId_contractId(...element.params_shortened),
						element.name,
					).toBe(element.results)
				}
				//
				else if (element.name === 'nested groups') {
					expect(vars___not.PAGE_subGroup_user, element.name).toBe(element.results)
					expect(vars_short.PAGE_subGroup_user, element.name).toBe(element.results)
				}
				//
				else {
					expect('We should never be here').toBe(
						'as all cases "variables" should be covered. Add an else if if you add a test',
					)
				}
			})
		})
	}

	it('post_update_run', async () => {
		const generated_file_path = 'src/test/ROUTES_post-update.ts'
		await run(false, {
			generated_file_path,
			post_update_run: 'echo done',
		})

		expect(true).toBe(true)
	})

	it('with path base', async () => {
		const generated_file_path = 'src/test/ROUTES_base.ts'
		await run(false, {
			generated_file_path,
			path_base: true,
		})

		const content = read(generated_file_path) ?? ''

		expect(content.includes('import { base } from')).toBe(true)
		expect(content.includes('$app/paths')).toBe(true)
		expect(content.includes('${base}')).toBe(true)
	})

	it('with router hash', async () => {
		const generated_file_path = 'src/test/ROUTES_hash.ts'
		await run(false, {
			generated_file_path,
			router_type: 'hash',
		})

		expect(read(generated_file_path)?.includes('#/')).toBe(true)
	})
})
