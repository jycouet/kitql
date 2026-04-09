import type { PluginOption } from 'vite'

import { gray, green, Log, yellow } from '@kitql/helpers'
import { print, type KitQLParseResult } from '@kitql/internals'

import { nullifyImports } from './nullifyImports.js'
import { transformStrip, type StripConfig } from './transformStrip.js'

const tsFileFilter = /\.ts$/

/**
 * Default `strip` config tuned for [remult](https://remult.dev/):
 * wraps `@BackendMethod` method bodies and the server-only callbacks
 * (`backendPrefilter`, `backendPreprocessFilter`, `sqlExpression`, `saved`)
 * inside `@Entity(...)` options in `if (import.meta.env.SSR) { ... }`.
 *
 * Spread it (or extend it) when you call `stripper`:
 * ```ts
 * stripper({ strip: [...defaultStripConfig, { decorator: 'MyCustom' }] })
 * ```
 */
export const defaultStripConfig: StripConfig[] = [
	{ decorator: 'BackendMethod' },
	{
		decorator: 'Entity',
		args_1: [
			{ fn: 'backendPrefilter' },
			{ fn: 'backendPreprocessFilter' },
			{ fn: 'sqlExpression' },
			{ fn: 'saved' },
			{ fn: 'deleted' },
		],
	},
]

export type ViteStripperOptions = {
	/**
	 * Wrap matching method bodies in `if (import.meta.env.SSR) { ... }` so they
	 * get tree-shaken from the client bundle.
	 *
	 * If omitted, {@link defaultStripConfig} is used (remult-friendly defaults:
	 * `@BackendMethod`, plus `backendPrefilter`/`backendPreprocessFilter`/
	 * `sqlExpression`/`saved` inside `@Entity(...)`).
	 *
	 * @example Custom config
	 * ```ts
	 *	strip: [
	 *		{ decorator: 'BackendMethod' },
	 *		{
	 *			decorator: 'Entity',
	 *			args_1: [
	 *				{ fn: 'backendPrefilter' },
	 *				{ fn: 'backendPreprocessFilter' },
	 *				{ fn: 'sqlExpression' },
	 *				{ fn: 'saved', excludeEntityKeys: ['users'] }
	 *			]
	 *		}
	 *	]
	 * ```
	 */
	strip?: StripConfig[]

	/**
	 * For example if you set `nullify: ['mongodb']`
	 *
	 * @example 1
	 * ```ts
	 * // This line
	 * import { AUTH_SECRET, AUTH_SECRET_NOT_USED } from '$env/static/private'
	 *
	 * // We become
	 * let AUTH_SECRET = null;
	 * let AUTH_SECRET_NOT_USED = null;
	 * ```
	 *
	 * @example 2
	 * ```ts
	 * // This line
	 * import { ObjectId } from 'mongodb'
	 *
	 * // We become
	 * let ObjectId = null;
	 * ```
	 */
	nullify?: string[]

	/**
	 * internal usage ;-)
	 */
	debug?: boolean
}

/**
 * Add this vite plugin in your vite.config.ts as first one.
 *
 * Calling `stripper()` with no options applies {@link defaultStripConfig}
 * (a remult-friendly default).
 *
 * ```ts
 * import { sveltekit } from '@sveltejs/kit/vite'
 * import { defineConfig } from 'vite'
 * import { stripper } from 'vite-plugin-stripper'
 *
 * export default defineConfig({
 *   plugins: [
 *     stripper(), // 👈 uses defaultStripConfig
 *     sveltekit(),
 *   ],
 * })
 * ```
 */
export function stripper(options?: ViteStripperOptions): PluginOption {
	const log = new Log('stripper')
	const stripConfig = options?.strip ?? defaultStripConfig

	const plugins: PluginOption = [
		{
			name: 'vite-plugin-stripper',
			enforce: 'pre',

			applyToEnvironment(environment) {
				return environment.name === 'client'
			},

			transform: {
				filter: {
					id: tsFileFilter,
				},
				async handler(code, id, option) {
					// Don't transform server-side code
					// https://vite.dev/changes/this-environment-in-hooks.html
					// To make your plugin backward compatible with the older versions, I keep this for now.
					// For vite >= 6.x, applyToEnvironment is doing the job.
					if (option?.ssr) {
						return
					}
					// files are only in ts
					// https://vite.dev/guide/rolldown#hook-filter-feature
					// To make your plugin backward compatible with the older versions, make sure to also run the filter inside the hook handlers.
					// For vite >= 6.3.x, filter is doing the job.
					if (!id.endsWith('.ts')) {
						return
					}

					const allInfos: string[] = []
					let code_ast: string | KitQLParseResult = code

					if (options && options?.nullify && options.nullify.length > 0) {
						const { info, ast: transformed } = await nullifyImports(code_ast, options.nullify)

						// Update the code for later transforms & return it
						if (transformed !== null) {
							code_ast = transformed
						}
						allInfos.push(...info)
					}

					if (stripConfig.length > 0) {
						const { info, ast: transformed } = await transformStrip(code_ast, stripConfig)

						// Update the code for later transforms & return it
						if (transformed !== null) {
							code_ast = transformed
						}
						allInfos.push(...info)
					}

					if (allInfos.length > 0 && typeof code_ast !== 'string' && code_ast !== null) {
						const toRet = print(code_ast)

						if (options?.debug) {
							log.info(
								`${gray('File:')} ${yellow(id)}\n` +
								`${green('-----')}\n` +
								`${toRet.code}` +
								`\n${green(':::::')}\n` +
								`${allInfos.join('\n')}` +
								`\n${green('-----')}\n`,
							)
						}

						return toRet
					}
				},
			},
		},
	]

	return plugins
}
