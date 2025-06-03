import { readFileSync } from 'fs'
import type { PluginOption } from 'vite'
import { watchAndRun } from 'vite-plugin-watch-and-run'

import { gray, green, Log, yellow } from '@kitql/helpers'
import { getFilesUnder, print, type ParseResult } from '@kitql/internals'

import { nullifyImports } from './nullifyImports.js'
import { transformStrip, type StripConfig } from './transformStrip.js'
import { transformWarningThrow, type WarningThrow } from './transformWarningThrow.js'

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
	 * If true, skip warnings if a throw is not a class.
	 *
	 * @default false
	 */
	log_on_throw_is_not_a_new_class?: boolean

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
	let listOrThrow: WarningThrow[] = []

	const display = () => {
		listOrThrow.forEach((item) => {
			log.error(
				`Throw is not a new class in ${yellow(item.relativePathFile)}:${yellow(String(item.line))}`,
			)
		})
		listOrThrow = []
	}

	const getProjectPath = () => {
		return process.cwd() + '/src'
	}

	const plugins: PluginOption = [{
		name: 'vite-plugin-stripper',
		enforce: 'pre',

		config: async () => {
			if (options?.log_on_throw_is_not_a_new_class) {
				const files = getFilesUnder(getProjectPath())
				listOrThrow = []
				for (let i = 0; i < files.length; i++) {
					const absolutePath = getProjectPath() + '/' + files[i]
					const code = readFileSync(absolutePath, { encoding: 'utf8' })
					const { list } = await transformWarningThrow(
						absolutePath,
						getProjectPath(),
						code,
						options?.log_on_throw_is_not_a_new_class,
					)
					listOrThrow.push(...list)
				}
				display()
			}
		},

		transform: async (code, filepath, option) => {
			// Don't transform server-side code
			if (option?.ssr) {
				return
			}
			// files are only in ts
			if (!filepath.endsWith('.ts')) {
				return
			}

			const allInfos: string[] = []
			let code_ast: string | ParseResult = code

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

			if (allInfos.length > 0) {
				const toRet = print(code_ast)

				if (options?.debug) {
					log.info(
						`${gray('File:')} ${yellow(filepath)}\n` +
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
	}]

	if (options?.log_on_throw_is_not_a_new_class) {
		plugins.push(
			// Run the thing when any changes happens in the project
			watchAndRun([
				{
					name: 'vite-plugin-stripper-throw-not-new-class',
					logs: [],
					watch: ['**'],
					run: async (server, absolutePath) => {
						if (options?.log_on_throw_is_not_a_new_class) {
							// Only file in our project
							if (absolutePath && absolutePath.startsWith(getProjectPath())) {
								const code = readFileSync(absolutePath, { encoding: 'utf8' })

								const { list } = await transformWarningThrow(
									absolutePath,
									getProjectPath(),
									code,
									options?.log_on_throw_is_not_a_new_class,
								)
								listOrThrow.push(...list)
								display()
							}
						}
					},
				},
			]))
	}

	return plugins
}
