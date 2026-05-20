import { parseArgs as nodeParseArgs } from 'node:util'

export interface CliOption {
	type: 'boolean' | 'string'
	short?: string
	default?: string | boolean
	description?: string
}

export interface CliConfig {
	name?: string
	description?: string
	version?: string
	options: Record<string, CliOption>
	allowPositionals?: boolean
	/** Defaults to process.argv.slice(2). */
	args?: string[]
}

export interface CliResult {
	values: Record<string, string | boolean | undefined>
	positionals: string[]
	help: string
}

/**
 * Thin wrapper over node:util parseArgs.
 * - Applies defaults itself (node:util `default` is not available across all Node >=18).
 * - Auto-registers `help` (-h) and, when a version is set, `version`, so strict mode
 *   does not throw on those flags. Does NOT print or exit - the caller decides.
 */
export function parseCli(config: CliConfig): CliResult {
	const parseOptions: Record<string, { type: 'boolean' | 'string'; short?: string }> = {}
	for (const [name, opt] of Object.entries(config.options)) {
		parseOptions[name] = { type: opt.type, ...(opt.short ? { short: opt.short } : {}) }
	}
	if (!parseOptions.help) {
		parseOptions.help = { type: 'boolean', short: 'h' }
	}
	if (config.version && !parseOptions.version) {
		parseOptions.version = { type: 'boolean' }
	}

	const { values, positionals } = nodeParseArgs({
		args: config.args ?? process.argv.slice(2),
		options: parseOptions,
		allowPositionals: config.allowPositionals ?? false,
	})

	const result = values as Record<string, string | boolean | undefined>
	for (const [name, opt] of Object.entries(config.options)) {
		if (result[name] === undefined && opt.default !== undefined) {
			result[name] = opt.default
		}
	}

	return { values: result, positionals, help: buildHelp(config) }
}

function buildHelp(config: CliConfig): string {
	const lines: string[] = []
	if (config.name) {
		lines.push(config.version ? `${config.name} v${config.version}` : config.name)
	}
	if (config.description) {
		lines.push(config.description)
	}
	if (lines.length) {
		lines.push('')
	}
	lines.push('Options:')
	const entries = Object.entries(config.options)
	for (const [name, opt] of entries) {
		const flags = [opt.short ? `-${opt.short}` : null, `--${name}`].filter(Boolean).join(', ')
		const def = opt.default !== undefined ? ` (default: ${String(opt.default)})` : ''
		lines.push(`  ${flags}${opt.description ? `  ${opt.description}` : ''}${def}`)
	}
	lines.push(`  -h, --help  show this help`)
	if (config.version) {
		lines.push(`  --version  show version`)
	}
	return lines.join('\n')
}
