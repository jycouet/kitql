import type { PluginOption } from 'vite'

import { gray, green, Log, yellow } from '@kitql/helpers'
import { print, type KitQLParseResult } from '@kitql/internals'

import { nullifyImports } from './nullifyImports.js'
import { transformStrip, type StripConfig } from './transformStrip.js'

export type ViteStripperOptions = {
	/**
	 * for example: `['BackendMethod']`
	 * @deprecated, you should use `strip` instead
	 */
	decorators?: string[]

	/**
	 * If true, will empty almost all the file if a decorator is found. (experimental!)
	 * @deprecated, you should use `strip` instead
	 */
	hard?: boolean

	/**
	 * Wrap the code in an if(import.meta.env.SSR) condition if it's belongs a match of the config.
	 *
	 * @example Advanced format
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
 * It should look like this:
 * ```ts
	import { sveltekit } from "@sveltejs/kit/vite";
	import { defineConfig } from "vite";
	import { stripper } from "vite-plugin-stripper";   // 👈
  
	export default defineConfig({
		plugins: [
			stripper({ decorators: ['BackendMethod'] }),  // 👈
			sveltekit()
		],
	});
 * ```
 * 
 */
export function stripper(options?: ViteStripperOptions): PluginOption {
	const log = new Log('stripper')

	const getProjectPath = () => {
		return process.cwd() + '/src'
	}

	const plugins: PluginOption = [
		{
			name: 'vite-plugin-stripper',
			enforce: 'pre',

			applyToEnvironment(environment) {
				return environment.name === 'client'
			},

			transform: {
				filter: {
					id: /\.ts$/,
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
						const { info, code_ast: transformed } = await nullifyImports(code_ast, options.nullify)

						// Update the code for later transforms & return it
						code_ast = transformed
						allInfos.push(...info)
					}

					if (options && options?.strip && options.strip.length > 0) {
						const { info, code_ast: transformed } = await transformStrip(code_ast, options.strip)

						// Update the code for later transforms & return it
						code_ast = transformed
						allInfos.push(...info)
					}

					if (allInfos.length > 0 && typeof code_ast !== 'string') {
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
