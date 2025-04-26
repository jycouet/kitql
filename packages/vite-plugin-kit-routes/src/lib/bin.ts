#!/usr/bin/env node
import path from 'node:path'
import { Command } from 'commander'

import { green, Log } from '@kitql/helpers'
import { getRelativePackagePath, read } from '@kitql/internals'

import { evaluateNode, getExportsFromFile } from './ast.js'
import { run } from './plugin.js'

const program = new Command()
const log = new Log('kit-routes')

async function loadConfigFromFile(
	filePath: string,
	exportName?: string,
): Promise<{ status: 'NoFile' | 'NoExport' | 'Invalid' | 'InvalidObject' | 'Valid'; result: any }> {
	try {
		const resolvedPath = path.resolve(process.cwd(), filePath)
		const code = read(resolvedPath)
		if (!code) {
			log.error(`Could not read file: ${resolvedPath}`)
			return { status: 'NoFile', result: null }
		}

		const exported = getExportsFromFile(code, exportName)
		if (!exported) {
			log.error(`There is no 'export const ${exportName}' in '${filePath}'`)
			return { status: 'NoExport', result: null }
		}

		const result = evaluateNode(exported)

		let isValidResult = true
		if (result['callee']) {
			isValidResult = false
		}

		if (!result || !isValidResult) {
			if (exportName) {
				log.error(`There is no 'export const ${exportName}' in '${filePath}'`)
			} else {
				log.error(`There is no default export in '${resolvedPath}' 
(or it's not a valid kit-routes config object)`)
			}
			return { status: 'InvalidObject', result: null }
		}

		return { status: 'Valid', result }
	} catch (error) {
		return { status: 'Invalid', result: null }
	}
}

let exportName = '_kitRoutesConfig'

async function loadConfig(configPath?: string) {
	if (configPath) {
		const [filePath, local_exportName] = configPath.split('#')
		const userConfig = await loadConfigFromFile(filePath, local_exportName)
		exportName = local_exportName
		if (userConfig.status === 'Valid') return userConfig.result
		return null
	}

	// Try vite.config.ts with _kitRoutesConfig
	const tsConfig = await loadConfigFromFile('vite.config.ts', exportName)
	if (tsConfig.status === 'Valid') return tsConfig.result
	if (tsConfig.status === 'NoExport') return null

	// Try vite.config.js with _kitRoutesConfig
	const jsConfig = await loadConfigFromFile('vite.config.js', exportName)
	if (jsConfig) return jsConfig

	return null
}

let version = 'dev'
try {
	const pPath = getRelativePackagePath('vite-plugin-kit-routes')
	if (pPath) {
		const pkg = JSON.parse(read(path.resolve(pPath, 'package.json')) ?? '{}')
		version = pkg.version
	}
} catch (error) { }

program.name('kit-routes').description('CLI for kit-routes plugin').version(version)

program
	.command('sync')
	.description('Sync routes configuration')
	.option('-c, --config <path>', 'Path to config file (default: vite.config.ts)')
	.action(async (options) => {
		const config = await loadConfig(options.config)
		if (!config) {
			log.info('')
			log.info(`  Config object should look like this:

               ${green(`import { kitRoutes, type Options } from 'vite-plugin-kit-routes'
               
               export const ${exportName}: Options = {
                 // ...
               }`)}
`)
			log.info('')
			log.info('You can specify a custom config file using --config with the following format:')
			log.info('  --config ./path/to/config.ts#named_export')
			log.info('  If no named export is specified, it will use the default export')
			log.info('')

			process.exit(1)
		}

		const success = await run(true, config)
		if (!success) {
			process.exit(1)
		}
	})

program.parse()
