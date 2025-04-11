#!/usr/bin/env node
import path from 'node:path'
import { Command } from 'commander'

import { Log } from '@kitql/helpers'
import { getRelativePackagePath, read } from '@kitql/internals'

import { run } from './plugin.js'

const program = new Command()
const log = new Log('Kit Routes')

async function loadConfigFromFile(filePath: string, exportName?: string) {
	try {
		const resolvedPath = path.resolve(process.cwd(), filePath)
		const configModule = await import(resolvedPath)

		if (exportName) {
			if (!configModule[exportName]) {
				log.error(`There is no 'export const ${exportName}' in '${filePath}'`)
				return null
			}
			return configModule[exportName]
		}

		if (!configModule.default) {
			log.error(`There is no default export in '${resolvedPath}'`)
			return null
		}
		return configModule.default
	} catch (error) {
		return null
	}
}

async function loadConfig(configPath?: string) {
	if (configPath) {
		const [filePath, exportName] = configPath.split('#')
		return loadConfigFromFile(filePath, exportName)
	}

	// Try vite.config.ts with _kitRoutesConfig
	const tsConfig = await loadConfigFromFile('vite.config.ts', '_kitRoutesConfig')
	if (tsConfig) return tsConfig

	// Try vite.config.js with _kitRoutesConfig
	const jsConfig = await loadConfigFromFile('vite.config.js', '_kitRoutesConfig')
	if (jsConfig) return jsConfig

	// Try vite.config.ts with default export
	const tsDefaultConfig = await loadConfigFromFile('vite.config.ts')
	if (tsDefaultConfig) return tsDefaultConfig

	// Try vite.config.js with default export
	const jsDefaultConfig = await loadConfigFromFile('vite.config.js')
	if (jsDefaultConfig) return jsDefaultConfig

	log.error('No configuration found in vite.config.ts or vite.config.js')
	log.info('You can specify a custom config file using --config with the following format:')
	log.info('  --config ./path/to/config.ts#named_export')
	log.info('  If no named export is specified, it will use the default export')
	return null
}

let version = '0.8.5-next.0'
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
			process.exit(1)
		}

		const success = await run(true, config)
		if (!success) {
			process.exit(1)
		}
	})

program.parse()
