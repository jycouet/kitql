import { spawn } from 'child_process'
import { posix } from 'path'
import type { PluginOption } from 'vite'
import { watchAndRun } from 'vite-plugin-watch-and-run'

import { cyan, gray, green, italic, Log, red, stry0, yellow } from '@kitql/helpers'
import { dirname, getFilesUnder, read, write } from '@kitql/internals'

import { getActionsOfServerPages, getMethodsOfServerFiles } from './ast.js'
import { appendSp, format, paramType, routeFn } from './format.js'

export type RouteMappings = {
	PAGES: Record<string, string>
	SERVERS: Record<string, string>
	ACTIONS: Record<string, string>
	Params: Record<string, string>
}

type LogKind = 'update' | 'post_update_run' | 'errors' | 'stats'
type FormatKind =
	| 'route(path)'
	| 'route(symbol)'
	| 'variables'
	| 'object[path]'
	| 'object[symbol]'
	| 'route(path) & object[path]'
	| 'route(symbol) & object[symbol]'

export type Options<T extends RouteMappings = RouteMappings> = {
	/**
	 * run any command after an update of some routes.
	 *
	 * @example
	 * ```ts
	 * 'npm exec prettier ./src/lib/ROUTES.ts -- -w'
	 * ```
	 */
	post_update_run?: string

	/**
	 * Tune your logs to get exaclty what you want.
	 */
	logs?: {
		/**
		 * When the file is updated
		 * @default true
		 */
		update?: boolean
		/**
		 * to log the command you run
		 * @default true
		 */
		post_update_run?: boolean
		/**
		 * in case you have some!
		 * @default true
		 */
		errors?: boolean
		/**
		 * to have some stats about your routes & co 🥳
		 * @default false
		 */
		stats?: boolean
	}

	/**
	 * Export ROUTES, LINKS, SERVERS and ACTIONS constants in the generated file
	 * Does nothing when the format is "variables", as exporting is required then.
	 * @default false
	 */
	exportObjects?: boolean

	/**
	 * @default 'src/lib/ROUTES.ts'
	 */
	generated_file_path?: string

	/**
	 * ```ts
	 * // format: route(path)        -> default <-
	 * route("/site/[id]", { id: 7, tab: 'info' })
	 *
	 * // format: route(symbol)
	 * route("site_id", { id: 7, tab: 'info' })
	 *
	 * // format: `variables` (best for code splitting & privacy)
	 * PAGE_site_id({ id: 7, tab: 'info' })
	 *
	 * // format: object[path]
	 * PAGES["/site/[id]"]({ id: 7, tab: 'info' })
	 *
	 * // format: object[symbol]
	 * PAGES.site_id({ id: 7, tab: 'info' })
	 * ```
	 */
	format?: FormatKind

	/**
	 * default is: `false`
	 *
	 * If you have only 1 required param, it will be a direct arg (not part of an object).
	 *
	 * ```ts
	 * route("/site/[id]", 7)       // format: route(path)
	 * route("site_id", 7)          // format: route(symbol)
	 * PAGE_site_id(7)              // format: variables
	 * PAGES["/site/[id]"](7)       // format: object[path]
	 * PAGES.site_id(7)             // format: object[symbol]
	 * ```
	 */
	format_short?: boolean

	/**
	 * default is: `false`
	 *
	 * ```ts
	 * // with `true` (it will match $page.route.id)
	 * route('/[[lang]]/gp/(logged)/one')
	 *
	 * // with `false`
	 * route('/gp/one')
	 * ```
	 *
	 * Could be usefull to set the `active` class on the current link for example.
	 */
	format_page_route_id?: boolean

	/**
	 * default is: `string | number`
	 */
	default_type?: string

	/**
	 * In case you have set a `base` in your `svelte.config.js`, you can set `path_base: true`
	 * to have it in your routes.
	 *
	 * FYI, in your `svelte.config.js`:
	 * ```js
	 * const config = {
	 *   kit: {
	 *     adapter: adapter(),
	 *     paths: {
	 *       base: '/yop',
	 *     }
	 *   }
	 * }
	 *
	 * export default config
	 * ```
	 *
	 * @default false
	 */
	path_base?: boolean

	/**
	 * What type of client-side router to use.
	 * - 'pathname' is the default and means the current URL pathname determines the route
	 * - 'hash' means the route is determined by location.hash. In this case, SSR and prerendering are disabled. This is only recommended if pathname is not an option, for example because you don't control the webserver where your app is deployed.
	 * @default "pathname"
	 */
	router_type?: 'pathname' | 'hash'

	/**
	 * @default `src/routes`
	 */
	routes_path?: string

	/**
	 * Needed if you changed it in your `svelte.config.js` & if you have some match params.
	 * @default "src/params"
	 */
	path_params?: string

	/**
	 * when `without` _(default)_, paths doesn't get a last argument to set extra search params
	 *
	 * when `with`, each paths get an extra arg for open search param
	 *
	 * ⚠️ **We don't recommend to use it, but it can be useful in some cases.**
	 *
	 * Can be tuned at individual path level
	 */
	extra_search_params?: 'with' | 'without'

	/**
	 * When `never` _(default)_, trailing slashes are removed from the URL.
	 * You can also set it to `always` to add trailing slashes to the URL.
	 * Learn more about trailing slashes in the [SvelteKit documentation](https://kit.svelte.dev/docs/page-options#trailingslash).
	 *
	 * We decide for a global config flag as a first step [link to issue](https://github.com/jycouet/kitql/issues/698).
	 */
	trailingSlash?: 'never' | 'always'

	PAGES?: Partial<{ [K in keyof T['PAGES']]: CustomPath<Extract<T['PAGES'][K], string>> }>
	SERVERS?: Partial<{ [K in keyof T['SERVERS']]: CustomPath<Extract<T['SERVERS'][K], string>> }>
	ACTIONS?: Partial<{ [K in keyof T['ACTIONS']]: CustomPath<Extract<T['ACTIONS'][K], string>> }>
	/**
	 * ```ts
	 * {
	 *   // ... Example ...
	 *   LINKS: {
	 *    // reference to a hardcoded link
	 *    twitter: 'https://twitter.com/jycouet',
	 *    // ✅ <a href={LINKS.twitter}>Twitter</a>
	 *
	 *    // reference to link with params! (Like svelteKit routes add [ ] to specify params)
	 *    twitter_post: 'https://twitter.com/[name]/status/[id]',
	 *    // ✅ <a href={LINKS.twitter_post({ name: 'jycouet', id: '1727089217707159569' })}>Twitter Post</a>
	 *
	 *    // reference to link with params & search params!
	 *    gravatar: {
	 *      href: 'https://www.gravatar.com/avatar/[str]',
	 *      explicit_search_params: {
	 *        s: { type: 'number', default: 75 },
	 *        d: { type: '"retro" | "identicon"', default: '"identicon"' },
	 *      },
	 *    },
	 *    // ✅ <img src={LINKS.gravatar({ str: 'jycouet', s: 20 })} alt="logo" />
	 *  }
	 * }
	 * ```
	 */
	LINKS?: Record<string, string | ({ href: string } & CustomPath<string>)>

	/**
	 * To override the type of a param globally.
	 */
	override_params?: Partial<{ [K in keyof T['Params']]: OverrideParam }>
}

export type CustomPath<Params extends string | never = string> = {
	/**
	 * Add to this route an explicit search params (with some options)
	 * @example
	 * explicit_search_params {
	 *   limit: {                   // name of the search param
	 *     required?: true | false, // default: false
	 *     type: 'number',          // default: 'string | number'
	 *     default: 12,             // default: undefined
	 *   }
	 * }
	 */
	explicit_search_params?: Record<string, ExplicitSearchParam>

	/**
	 * Specify for this route the type & a default.
	 * @example
	 * params {
	 *   id: {                   // name of the param (if you set the plugin `kitRoutes<KIT_ROUTES>`, it will be typed!)
	 *     type: 'number',       // default: 'string | number'
	 *     default: 12,          // default: undefined
	 *   }
	 * }
	 */
	params?: Partial<Record<Params, ExtendParam>>

	/**
	 * If `with`, you can add extra search params to this route (without any typecheck!)
	 *
	 * ⚠️ **We don't recommend to use it, but it can be useful in some cases.**
	 */
	extra_search_params?: 'default' | 'with' | 'without'

	/**
	 * Specify the hash of the route (also named anchor sometimes).
	 * @example
	 * hash: {
	 *   type: '"section0" | "section1" | "section2" | "section3"',
	 *   required: true,
	 *   default: '"section0"',
	 * }
	 */
	hash?: ExtendParam & {
		required?: boolean
		default?: string
	}
}

export type OverrideParam = {
	type: string
	// default?: string //TODO one day?
}

export type ExtendParam = {
	type?: string
	/**
	 * Default value for the param
	 *
	 * @example
	 * { type: 'number', default: 75 }
	 * or
	 * { type: 'string', default: 'jycouet' }
	 */
	default?: any
}

export type ExplicitSearchParam = ExtendParam & {
	required?: boolean
	/**
	 * Controls how arrays are converted into parameters.
	 * `join` will join elements with `,` into a single parameter.
	 * With `split` the parameter will be repeated for each element.
	 *
	 * @default 'split'
	 */
	arrayMode?: 'join' | 'split'
}

export const log = new Log('Kit Routes')

export function routes_path(routes_path = 'src/routes') {
	return posix.join(process.cwd(), routes_path)
}

export function rmvGroups(key: string) {
	const toRet = key
		// rmv /(groups)
		.replace(/\/\([^)]*\)/g, '')
		// rmv (groups)
		.replace(/\([^)]*\)/g, '')

	return toRet
}

export function rmvOptional(key: string) {
	const toRet = key
		// rmv /[[Optional]]
		.replace(/\/\[\[.*?\]\]/g, '')
		// rmv [[Optional]]
		.replace(/\[\[.*?\]\]/g, '')
	return toRet
}

export function formatKey(key: string, o: Options) {
	const options = getDefaultOption(o)
	let toRet = o.format_page_route_id ? key : rmvGroups(rmvOptional(key))

	// In case we have only an optional param
	if (toRet === '') {
		toRet = '/'
	}

	if (options.format!.includes('path')) {
		return toRet
	}

	const toReplace = ['/', '[', ']', '(', ')', '-', '=', '.', ':']
	toRet = toRet
		.split('')
		.map((c) => (toReplace.includes(c) ? '_' : c))
		.join('')
		.replaceAll('...', '')
		.replaceAll('__', '_')
		.replaceAll('__', '_')
		.replaceAll('__', '_')
	if (toRet.startsWith('_')) {
		toRet = toRet.slice(1)
	}
	if (toRet.endsWith('_')) {
		toRet = toRet.slice(0, -1)
	}

	if (toRet === '') {
		toRet = '_ROOT'
	}

	return toRet
}

type MetadataToWrite = {
	keyToUse: string
	key_wo_prefix: string
	// prop: string
	paramsFromPath: Param[]
	strDefault: string
	strReturn: string
	strParams: string
}

export type KindOfObject = 'PAGES' | 'SERVERS' | 'ACTIONS' | 'LINKS'

const getMetadata = (files: string[], type: KindOfObject, o: Options, withAppendSp?: boolean) => {
	const options = getDefaultOption(o)
	const useWithAppendSp = withAppendSp && options?.extra_search_params === 'with'

	if (type === 'LINKS') {
		const toRet = Object.entries(options?.LINKS ?? {}).flatMap((c) => {
			const hrefToUse = typeof c[1] === 'string' ? c[1] : c[1].href
			return transformToMetadata(c[0], hrefToUse, type, options, useWithAppendSp)
		})
		return toRet.filter((c) => c !== null) as MetadataToWrite[]
	}

	const lookFor =
		type === 'PAGES'
			? ['+page.svelte', '+page.md']
			: type === 'SERVERS'
				? ['+server.ts']
				: ['+page.server.ts']

	// For windows
	files = files.map((c) => c.replaceAll('\\', '/'))

	// remove the layout info
	files = files.map((c) => c.replace(/@[^.]*\./, '.'))

	const toRet = files
		.filter((file) => lookFor.some((l) => file.endsWith(l)))
		.map((file) => {
			const matchedFile = lookFor.find((l) => file.endsWith(l)) ?? lookFor[0]
			return `/` + file.replace(`/${matchedFile}`, '').replace(matchedFile, '')
		})
		// Keep the sorting at this level, it will make more sense
		.sort()
		.flatMap((original) => transformToMetadata(original, original, type, options, useWithAppendSp))

	// First find all duplicates
	const duplicates = toRet.filter(
		(c, index, self) => self.findIndex((t) => t.keyToUse === c.keyToUse) !== index,
	)

	// If we have duplicates, remove the ones with empty strParams
	if (duplicates.length > 0) {
		const toRetFiltered = toRet.filter((item) => {
			const isDuplicate = duplicates.some((d) => d.keyToUse === item.keyToUse)
			if (!isDuplicate) return true
			return item.strParams !== ''
		})

		// Check if we still have duplicates after filtering
		const remainingDuplicates = toRetFiltered.filter(
			(c, index, self) => self.findIndex((t) => t.keyToUse === c.keyToUse) !== index,
		)

		if (remainingDuplicates.length > 0) {
			log.info(
				`Found duplicate routes with the same keyToUse after filtering: ${remainingDuplicates
					.map((d) => d.keyToUse)
					.join(
						', ',
					)} you can reopen https://github.com/jycouet/kitql/issues/665 as you have a more complcated use case`,
			)
		}

		return toRetFiltered
	}

	return toRet
}

type Param = {
	name: string
	optional: boolean
	matcher?: string
	type?: string
	default?: any
	fromPath?: boolean
	isArray: boolean
	needExtractParamType?: boolean
	isEncoded?: 'x+' | 'u+'
	decoded?: string
}

export const transformToMetadata = (
	original: string,
	originalValue: string,
	type: KindOfObject,
	options: Options,
	useWithAppendSp: boolean | undefined,
): MetadataToWrite[] => {
	const keyToUse = formatKey(original, options)
	const toRet = rmvGroups(originalValue)

	const list: MetadataToWrite[] = []

	const getSep = () => {
		return options?.format?.includes('route') || options?.format?.includes('path') ? ` ` : `_`
	}

	if (type === 'ACTIONS') {
		const { actions } = getActionsOfServerPages(originalValue)
		if (actions.length === 0) {
			// Nothing to do
		} else if (actions.length === 1 && actions[0] === 'default') {
			list.push(
				buildMetadata(
					type,
					originalValue,
					'default' + getSep() + keyToUse,
					keyToUse,

					useWithAppendSp,
					'',
					toRet,
					options,
				),
			)
		} else {
			actions.map((action) => {
				list.push(
					buildMetadata(
						type,
						originalValue,
						action + getSep() + keyToUse,
						keyToUse,

						useWithAppendSp,
						`?/${action}`,
						toRet,
						options,
					),
				)
			})
		}
	} else if (type === 'SERVERS') {
		const methods = getMethodsOfServerFiles(originalValue)
		if (methods.length === 0) {
			return []
		} else {
			methods.map((method) => {
				list.push(
					buildMetadata(
						type,
						originalValue,
						method + getSep() + keyToUse,
						keyToUse,

						useWithAppendSp,
						``,
						toRet,
						options,
					),
				)
			})
		}
	} else {
		list.push(
			buildMetadata(
				type,
				originalValue,
				keyToUse,
				keyToUse,

				useWithAppendSp,
				'',
				toRet,
				options,
			),
		)
	}

	return list
}

export function buildMetadata(
	type: KindOfObject,
	originalValue: string,
	keyToUse: string,
	key_wo_prefix: string,
	useWithAppendSp: boolean | undefined,
	actionsFormat: string,
	toRet: string,
	o: Options,
) {
	const options = getDefaultOption(o)
	// custom conf
	const viteCustomPathConfig = options?.[type]
	let customConf: CustomPath = {
		extra_search_params: 'default',
	}
	if (viteCustomPathConfig && viteCustomPathConfig[keyToUse]) {
		// @ts-expect-error
		customConf = viteCustomPathConfig[keyToUse]
	}

	const rawParamsFromPath = extractParamsFromPath(originalValue, options)
	const paramsFromPath = rawParamsFromPath.filter((c) => c.isEncoded === undefined)
	const specialNoParams = rawParamsFromPath.filter((c) => c.isEncoded !== undefined)

	// custom Param?
	if (customConf.params) {
		Object.entries(customConf.params).forEach((sp) => {
			for (let i = 0; i < paramsFromPath.length; i++) {
				if (paramsFromPath[i].name === sp[0]) {
					if (sp[1] && sp[1].type) {
						paramsFromPath[i].type = sp[1].type
					}
					if (sp[1] && sp[1].default !== undefined) {
						paramsFromPath[i].default = JSON.stringify(sp[1].default)
						// It's becoming optional because it has a default
						paramsFromPath[i].optional = true
					}
				}
			}
		})
	}

	// If empty... (it's in a group for example). Let's add a `/`
	if (toRet === '') {
		toRet = `/`
	}

	paramsFromPath.forEach((c) => {
		const sMatcher = `${c.matcher ? `=${c.matcher}` : ''}`

		// Very special case (only an optional param)
		if (toRet === `/[[${c.name + sMatcher}]]`) {
			toRet = `\${params?.['${c.name}'] ? \`/\${params?.['${c.name}']}\`: '/'}`
		} else {
			// Always 2 cases, with "/" prefix and without
			const cases = ['/', '']
			// First -> optionnals
			cases.forEach((prefix) => {
				toRet = toRet.replaceAll(
					`${prefix}[[${c.name + sMatcher}]]`,
					`\${params?.['${c.name}'] ? \`${prefix}\${params?.['${c.name}']}\`: ''}`,
				)
			})

			// Second -> params
			cases.forEach((prefix) => {
				toRet = toRet.replaceAll(`${prefix}[${c.name + sMatcher}]`, `${prefix}\${params['${c.name}']}`)
			})

			// Third -> [...rest]
			cases.forEach((prefix) => {
				toRet = toRet.replaceAll(
					`${prefix}[...${c.name + sMatcher}]`,
					`${prefix}\${params['${c.name}']?.join('/')}`,
				)
			})
		}
	})

	const params = []

	let isAllOptional = paramsFromPath.filter((c) => !c.optional).length === 0
	const paramsReq = paramsFromPath.filter((c) => !c.optional)

	if (customConf.hash) {
		customConf.explicit_search_params = {
			...customConf.explicit_search_params,
			hash: {
				type: customConf.hash.type,
				required: customConf.hash.required,
				default: customConf.hash.default,
				// @ts-expect-error
				isAnchor: true,
			},
		}
	}

	// custom search Param?
	const explicit_search_params_to_function: [param: string, val: string][] = []
	if (customConf.explicit_search_params) {
		let someParamsHaveDefault = paramsFromPath.filter((c) => c.default !== undefined).length > 0

		Object.entries(customConf.explicit_search_params).forEach((sp) => {
			const param = {
				name: sp[0],
				optional: !sp[1].required,
				type: sp[1].type,
				default: sp[1].default && JSON.stringify(sp[1].default),
				isArray: false,
				// @ts-expect-error
				isAnchor: sp[1].isAnchor,
			}

			paramsFromPath.push(param)

			if (sp[1].required) {
				isAllOptional = false
				paramsReq.push(param)
			}
			if (sp[1].default !== undefined) {
				someParamsHaveDefault = true
			}
		})

		let paramsIsOptional = isAllOptional
		if (options.format_short && paramsReq.length === 1) {
			paramsIsOptional = true
		}
		if (someParamsHaveDefault) {
			paramsIsOptional = false
		}

		Object.entries(customConf.explicit_search_params).forEach((sp) => {
			const val = paramsIsOptional ? `params?.['${sp[0]}']` : `params['${sp[0]}']`

			let key = sp[0]
			// @ts-expect-error
			if (sp[1].isAnchor) {
				key = `__KIT_ROUTES_ANCHOR__`
			}

			explicit_search_params_to_function.push([key, getSpValue(val, sp[1])])
		})
	}

	if (paramsFromPath.length > 0) {
		if (options.format_short && paramsReq.length === 1) {
			// If only ONE required param, and we have only one, then let's put params optional
			isAllOptional = true

			params.push(formatArg(paramsReq[0], options))

			// If it's in the explicite and it's THIS one, let's change the array...
			if (
				explicit_search_params_to_function.length === 1 &&
				(explicit_search_params_to_function[0][0] === paramsReq[0].name ||
					explicit_search_params_to_function[0][0] === `__KIT_ROUTES_ANCHOR__`)
			) {
				const sp = customConf.explicit_search_params![paramsReq[0].name]
				explicit_search_params_to_function[0][1] = getSpValue(paramsReq[0].name, sp)
			} else {
				// in params
				toRet = toRet.replaceAll(`params['${paramsReq[0].name}']`, paramsReq[0].name)
			}
		}
		params.push(`params${isAllOptional ? '?' : ''}: { ${formatArgs(paramsFromPath, options)} }`)
	}

	const explicit_search_params = explicit_search_params_to_function
		.map(([param, val]) => (param === val ? param : `'${param}': ${val}`))
		.join(', ')

	let fullSP = ''
	const wExtraSP =
		(customConf.extra_search_params === 'default' && useWithAppendSp) ||
		customConf.extra_search_params === 'with'

	const appendSpPrefix = actionsFormat ? `, '&'` : ''
	if (wExtraSP && !customConf.explicit_search_params) {
		params.push(`sp?: Record<string, string | number>`)
		fullSP = `\${appendSp(sp${appendSpPrefix})}`
	} else if (wExtraSP && customConf.explicit_search_params) {
		params.push(`sp?: Record<string, string | number>`)
		// We want explicite to be stronger and override sp
		fullSP = `\${appendSp({ ...sp, ${explicit_search_params} }${appendSpPrefix})}`
	} else if (!wExtraSP && customConf.explicit_search_params) {
		fullSP = `\${appendSp({ ${explicit_search_params} }${appendSpPrefix})}`
	}

	let paramsDefaults = paramsFromPath
		.filter((c) => c.default !== undefined)
		.map((c) => {
			return `params['${c.name}'] = params['${c.name}'] ?? ${c.default}; `
		})

	if (paramsDefaults.length > 0 && isAllOptional) {
		paramsDefaults = ['params = params ?? {}', ...paramsDefaults]
	}

	const pathBaesStr = options?.router_type === 'hash' ? '#' : options?.path_base ? '${base}' : ''
	const strDefault = paramsDefaults.length > 0 ? `${paramsDefaults.join('\n')}` : ''

	const completeToRet = `${pathBaesStr}${toRet}`
	const trailingSlashToUse = o.trailingSlash === 'always' && !completeToRet.endsWith('/') ? '/' : ''

	let strReturn = `\`${completeToRet}${trailingSlashToUse}${actionsFormat}${fullSP}\``
	for (let i = 0; i < specialNoParams.length; i++) {
		strReturn = strReturn.replace(specialNoParams[i].name, specialNoParams[i].decoded!)
	}
	const strParams = params.join(', ')

	const baseToReturn: MetadataToWrite = {
		keyToUse,
		key_wo_prefix,
		// prop,
		paramsFromPath,
		strDefault,
		strReturn,
		strParams,
	}

	return baseToReturn
}

function getSpValue(rawValue: string, param: ExplicitSearchParam) {
	if (param.arrayMode === 'join') {
		if (param.required || param.default !== undefined) {
			return `String(${rawValue})`
		}

		return `${rawValue} === undefined ? undefined : String(${rawValue})`
	}

	return rawValue
}

export function extractParamsFromPath(path: string, o: Options): Param[] {
	const options = getDefaultOption(o)
	const paramPattern = /\[+([^\]]+)]+/g
	let params: Param[] = []

	const relToParams = posix.relative(dirname(options.generated_file_path), options.path_params)

	let match
	while ((match = paramPattern.exec(path)) !== null) {
		// Check if it's surrounded by double brackets indicating an optional parameter
		const isOptional = match[0].startsWith('[[')
		const isArray = match[0].includes('...')
		const matcher = match[1].split('=')
		if (matcher.length === 2) {
			params.push({
				name: matcher[0].replace('...', ''),
				optional: isOptional,
				matcher: matcher[1],
				fromPath: true,
				isArray,
				// this will bring the type of the first arg of the function to to the match
				type: `ExtractParamType<typeof import('${relToParams}/${matcher[1]}.ts').match>`,
				needExtractParamType: true,
			})
		} else {
			params.push({
				name: match[1].replace('...', ''),
				optional: isOptional,
				fromPath: true,
				isArray,
			})
		}
	}

	params = params.map((p) => {
		if (p.name.startsWith('x+')) {
			const [, hex] = p.name.split('+')
			p.isEncoded = 'x+'
			p.decoded = String.fromCharCode(parseInt(hex, 16))
			p.name = `[${p.name}]`
		} else if (p.name.startsWith('u+')) {
			const [, hex] = p.name.split('+')
			p.isEncoded = 'u+'
			p.decoded = String.fromCharCode(parseInt(hex, 16))
			p.name = `[${p.name}]`
		}
		return p
	})

	const paramsU = params.filter((c) => c.isEncoded === 'u+')
	params = params.filter((c) => c.isEncoded !== 'u+')

	// Find consecutive pairs of u+ encoded parameters
	for (let i = 0; i < paramsU.length - 1; i++) {
		const currentParam = paramsU[i]
		const nextParam = paramsU[i + 1]
		const combinedName = `${currentParam.name}${nextParam.name}`

		// Check if the combined name exists in relToParams
		if (path.includes(combinedName)) {
			// Create a new parameter combining both
			const combinedParam: Param = {
				name: combinedName,
				optional: currentParam.optional && nextParam.optional,
				fromPath: true,
				isArray: false,
				isEncoded: 'u+',
				decoded: currentParam.decoded! + nextParam.decoded!,
			}

			// Remove the two original parameters and add the combined one
			params = params.filter((p) => p !== currentParam && p !== nextParam)
			params.push(combinedParam)

			// Skip the next parameter since we've already processed it
			i++
		}
	}

	return params
}

const formatArgs = (params: Param[], o: Options) => {
	const options = getDefaultOption(o)
	const paramsReq = params.filter((c) => !c.optional)
	if (options.format_short && paramsReq.length === 1) {
		params = params.filter((c) => c.optional)
	}

	const str = params
		.sort((a, b) => {
			// if (a.optional === b.optional) {
			//   // When 'optional' is the same, sort by 'name'
			//   return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
			// }
			// Otherwise, sort by 'optional'
			// Let's sort only by 'optional' at the end.
			return a.optional < b.optional ? -1 : 1
		})
		.map((c) => {
			return formatArg(c, o)
		})
		.join(', ')

	return str
}

const formatArg = (c: Param, o: Options) => {
	const options = getDefaultOption(o)

	const override_params = Object.entries(options?.override_params ?? {}).filter(
		(d) => d[0] === c.name,
	)

	let override_param = undefined
	if (override_params.length > 0) {
		override_param = override_params[0][1]?.type
	}

	const nameEscaped = c.name.includes('-') ? `'${c.name}'` : c.name

	return (
		`${nameEscaped}${c.optional ? '?' : ''}: ` +
		`(${c.type ?? override_param ?? options?.default_type ?? 'string | number'})` +
		`${c.isArray ? '[]' : ''}`
	)
}

const shouldLog = (kind: LogKind, o: Options) => {
	const options = getDefaultOption(o)

	if (options.logs.update && kind === 'update') {
		return true
	} else if (options.logs.post_update_run && kind === 'post_update_run') {
		return true
	} else if (options.logs.errors && kind === 'errors') {
		return true
	} else if (options.logs.stats && kind === 'stats') {
		return true
	}
	return false
}

export const getDefaultOption = (o?: Options) => {
	const options = {
		...o,
		logs: {
			update: true,
			post_update_run: true,
			errors: true,
			stats: false,
			...o?.logs,
		},
		format: o?.format ?? 'route(path)',
		generated_file_path: o?.generated_file_path ?? 'src/lib/ROUTES.ts',
		path_params: o?.path_params ?? 'src/params',
	}
	return options
}

const arrayToRecord = (arr?: string[]) => {
	if (arr && arr.length > 0) {
		return `: { ${arr.join(', ')} }`
	}
	return `: Record<string, never>`
}

export const run = async (atStart: boolean, o?: Options) => {
	const options = getDefaultOption(o)

	const files = getFilesUnder(routes_path(options.routes_path))

	// TODO check if harcoded links are around?
	// for (let i = 0; i < files.length; i++) {
	//   if (files[i].endsWith('.svelte')) {
	//     const pathToCheck = (options.routes_path ?? '/src/routes') + '/' + files[i]

	//     try {
	//       const found = extractHtmlElementAttr_Text(pathToCheck, [{ type: 'a', attr: 'href' }])
	//     } catch (error) {
	//       console.log(`error`, error)
	//     }
	//     // console.log(`found`, found, files[i])

	//     // log.info(
	//     //   `⚠️ Warning ${yellow(`action="?/save"`)} detected ` +
	//     //     `in ${gray('/routes/card/+page.svelte')} is not safe. ` +
	//     //     `You could use: ${green(`href={route('/card'}`)}`,
	//     // )
	//   }
	// }

	const objTypes: { type: KindOfObject; files: MetadataToWrite[] }[] = [
		{ type: 'PAGES', files: getMetadata(files, 'PAGES', options, true) },
		{ type: 'SERVERS', files: getMetadata(files, 'SERVERS', options, true) },
		{ type: 'ACTIONS', files: getMetadata(files, 'ACTIONS', options, false) },
		{ type: 'LINKS', files: getMetadata(files, 'LINKS', options, false) },
	]

	let needExtractParamType = false
	objTypes.forEach((c) => {
		c.files.forEach((d) => {
			if (d.paramsFromPath.some((e) => e.needExtractParamType)) {
				needExtractParamType = true
			}
		})
	})

	// Validate options
	const allOk = true
	objTypes
		.filter((c) => c.type !== 'LINKS')
		.forEach((o) => {
			Object.entries(options?.[o.type] ?? {}).forEach((e) => {
				const [key, cPath] = e
				const found = o.files.find((c) => c.keyToUse === key)
				if (!found) {
					if (shouldLog('errors', options)) {
						log.error(`Can't extend "${green(`${o.type}.`)}${red(key)}" as this path doesn't exist!`)
					}
					// Even with warning, we should wite the file
					// allOk = false
				} else {
					if (cPath) {
						Object.entries(cPath.params ?? {}).forEach((p) => {
							const [pKey] = p
							const paramsFromPathFound = found.paramsFromPath.find((c) => c.name === pKey)
							if (!paramsFromPathFound) {
								if (shouldLog('errors', options)) {
									log.error(
										`Can't extend "${green(`${o.type}.${key}.params.`)}${red(
											pKey,
										)}" as this param doesn't exist!`,
									)
								}
								// Even with warning, we should wite the file
								// allOk = false
							}
						})
					}
				}
			})
		})

	if (allOk) {
		const result = write(options.generated_file_path, [
			`/* eslint-disable */
/**
 * This file was generated by 'vite-plugin-kit-routes'
 *
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */${options?.path_base ? `\nimport { base } from '$app/paths'` : ''}
`,
			// consts
			options?.format === 'variables'
				? // Format variables
					objTypes
						.map((c) => {
							return `/**\n * ${c.type}\n */
${c.files
	.map((key) => {
		let valiableName = `${c.type.slice(0, -1)}_${key.keyToUse}`
		const invalidInVariable = ['-', ' ']
		for (const invalid of invalidInVariable) {
			valiableName = valiableName.replaceAll(invalid, '_')
		}

		if (key.strParams) {
			return (
				`export const ${valiableName} = (${key.strParams}) => {` +
				`${format({ bottom: 0, top: 1, left: 2 }, key.strDefault)}
  return ${key.strReturn}
}`
			)
		} else {
			return `export const ${valiableName} = ${key.strReturn}`
		}
	})
	.join('\n')}`
						})
						.join(`\n\n`)
				: // Format Others
					objTypes
						.map((c) => {
							return (
								`/**\n * ${c.type}\n */
${options?.exportObjects || options?.format?.includes('object') ? `export ` : ``}` +
								`const ${c.type} = {
  ${c.files
			.map((key) => {
				if (key.strParams) {
					return (
						`"${key.keyToUse}": (${key.strParams}) => {` +
						`${format({ bottom: 0, top: 1, left: 4 }, key.strDefault)}
    return ${key.strReturn}
  }`
					)
				} else {
					return `"${key.keyToUse}": ${key.strReturn}`
				}
			})
			.join(',\n  ')}
}`
							)
						})
						.join(`\n\n`),

			format({ top: 1, left: 0 }, appendSp),

			// add appendSp
			...(options?.format?.includes('route') ? [format({ left: 0 }, routeFn)] : []),

			...(needExtractParamType ? [format({ left: 0 }, paramType)] : []),

			// types
			`/**
* Add this type as a generic of the vite plugin \`kitRoutes<KIT_ROUTES>\`.
*
* Full example:
* \`\`\`ts
* import type { KIT_ROUTES } from '${dolLib}/ROUTES'
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
${objTypes
	.map((c) => {
		return `  ${c.type}${arrayToRecord(
			c.files.map((d) => {
				return `'${d.keyToUse}': ${
					d.paramsFromPath.filter((e) => e.fromPath === true).length === 0
						? 'never'
						: d.paramsFromPath
								.filter((e) => e.fromPath === true)
								.map((e) => {
									return `'${e.name}'`
								})
								.join(' | ')
				}`
			}),
		)}`
	})
	.join('\n')}
  Params${arrayToRecord([
			...new Set(
				objTypes.flatMap((c) =>
					c.files.flatMap((d) => d.paramsFromPath.map((e) => `'${e.name}': never`)),
				),
			),
		])}
}
`,
		])

		if (options?.post_update_run) {
			if (shouldLog('post_update_run', options)) {
				log.info(`${yellow(`post_update_run`)} "${green(options?.post_update_run)}" running...`)
			}

			// do the stuff
			const child = spawn(options.post_update_run, { shell: true })

			// report things
			if (shouldLog('post_update_run', options)) {
				child.stderr.on('data', (data) => {
					if (data.toString()) {
						log.info(data.toString())
					}
				})
			}

			// report errors
			if (shouldLog('errors', options)) {
				child.stderr.on('error', (data) => {
					const msg = data.toString().replace(/\n$/, '')
					if (msg.includes('DEP0040') && msg.includes('punycode')) {
						// silent error
					} else {
						log.error(msg)
					}
				})
			}

			const exitPromise = new Promise<void>((resolve) => {
				child.on('close', () => resolve())
			})

			await exitPromise

			if (shouldLog('update', options)) {
				theEnd(atStart, result, objTypes, options)
			}
		} else {
			theEnd(atStart, result, objTypes, options)
		}
		return true
	}

	return false
}

const dolLib = ['$', 'lib'].join('')

function theEnd(
	atStart: boolean,
	result: boolean,
	objTypes: { type: KindOfObject; files: MetadataToWrite[] }[],
	o: Options,
) {
	const options = getDefaultOption(o)
	if (result) {
		if (shouldLog('update', options)) {
			log.success(`${yellow(options.generated_file_path)} updated`)
		}
	}
	if (atStart && shouldLog('stats', options)) {
		let version = ''
		try {
			const pkg = JSON.parse(read('./package.json') ?? '{}')
			version =
				pkg.devDependencies['vite-plugin-kit-routes'] ??
				pkg.dependencies['vite-plugin-kit-routes'] ??
				''
		} catch (_error) {
			// silent error
		}
		const stats = []
		const nbRoutes = objTypes.flatMap((c) => c.files).length
		stats.push(
			`Routes: ${yellow('' + nbRoutes)} ` +
				`${italic(`(${objTypes.map((c) => `${c.type}: ${yellow('' + c.files.length)}`).join(', ')})`)}`,
		)
		const confgPoints = stry0(Object.entries(options ?? {}))!.length
		const shortV = options.format_short ? ' short' : ''

		stats.push(`Points: ${yellow('' + confgPoints)}`)
		const score = (confgPoints / nbRoutes).toFixed(2)
		stats.push(`Score: ${yellow(score)}`)
		stats.push(`Format: "${yellow('' + options?.format + shortV)}"`)

		log.success(`${green('Stats:')} ${stats.join(' | ')}`)
		log.info(
			`${gray(' Share on bluesky:')} ${cyan(
				createBSkyIntent([
					`🚀 Check out my #KitRoutes stats 🚀`,
					'',
					`- Routes: ${nbRoutes} (${objTypes.map((c) => c.files.length).join(', ')})`,
					`- Points: ${confgPoints}`,
					`- Score: ${score}`,
					`- Format: "${options?.format}${shortV}"`,
					`- Version: ${version}`,
					'',
					`@jyc.dev 👀`,
				]),
			)}`,
		)
	}
}
// TODO: fix this one day!
// https://github.com/bluesky-social/social-app/issues/6133
export function createBSkyIntent(msg: string[]) {
	// const lowerCaseUserAgent = navigator.userAgent.toLowerCase()

	// let lineBreak = '\r\n'

	// if (lowerCaseUserAgent.includes('windows')) {
	// }
	const lineBreak = '<br />'
	// console.log(`lowerCaseUserAgent`, { lowerCaseUserAgent, lineBreak })

	return `https://bsky.app/intent/compose?text=${encodeURIComponent(msg.join(lineBreak))}`
}

/**
 * First you can start with something simple:
 * ```ts
 * import { kitRoutes } from 'vite-plugin-kit-routes'
 *
 * kitRoutes({
 *  // Conf
 * })
 * ```
 * ---
 * Then, you can add the `ROUTES` type... It will be crazy good!
 * ```ts
 * import type { KIT_ROUTES } from '$lib/ROUTES'
 * import { kitRoutes } from 'vite-plugin-kit-routes'
 *
 * kitRoutes<KIT_ROUTES>({
 *  // Conf
 * })
 * ```
 */
export function kitRoutes<T extends RouteMappings = RouteMappings>(
	options?: Options<T>,
): PluginOption {
	return [
		// Run the thing at startup
		{
			name: 'kit-routes',
			async buildStart() {
				if (this.environment?.config?.env?.MODE === 'test') {
					// Don't run in test mode (vite v6)
				} else {
					await run(true, options)
				}
			},
		},

		// Run the thing when any change in a +page.svelte (add, remove, ...)
		watchAndRun([
			{
				name: 'kit-routes-watch-svelte-files',
				logs: [],
				watchKind: ['add', 'unlink'],
				watch: ['**/+page.svelte'],
				run: async () => {
					await run(false, options)
				},
			},

			{
				name: 'kit-routes-watch-server-files',
				logs: [],
				watch: ['**/+page.server.ts', '**/+server.ts'],
				run: async () => {
					await run(false, options)
				},
			},
		]),
	]
}
