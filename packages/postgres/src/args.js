import { parseCli } from '@kitql/helpers/server'

export const DEFAULT_PORT = 5432

/** command -> [usage, description, required positionals] */
export const COMMANDS = /** @type {const} */ ({
	up: ['up', 'start the repo server in the foreground (Ctrl+C stops it)', 0],
	stop: ['stop', 'stop the repo server (if `up` was killed)', 0],
	init: ['init', 'create the worktree database (idempotent, timezone UTC)', 0],
	clone: [
		'clone <from>',
		'replace the worktree database by a copy of <from> (db or worktree name)',
		1,
	],
	drop: ['drop', 'drop the worktree database', 0],
	ls: ['ls', 'list databases of the server', 0],
	dump: ['dump [file]', 'pg_dump the worktree database (default: <db>.dump)', 0],
	restore: ['restore <file>', 'restore a dump (.dump or .sql) into the worktree database', 1],
	psql: ['psql [-- args]', 'open psql on the worktree database', 0],
	url: ['url', 'print the connection url of the worktree database', 0],
})

/** @typedef {keyof typeof COMMANDS} Command */

const cliConfig = {
	name: 'kitql-pg',
	description: [
		'Local PostgreSQL: one server per repo, one database per worktree.',
		'',
		'Usage: kitql-pg <command> [options]',
		'',
		'Commands:',
		...Object.values(COMMANDS).map(([usage, desc]) => `  ${usage.padEnd(16)}${desc}`),
	].join('\n'),
	allowPositionals: true,
	options: {
		db: {
			type: /** @type {const} */ ('string'),
			short: 'd',
			description: 'target database (default: the worktree one)',
		},
		port: {
			type: /** @type {const} */ ('string'),
			short: 'p',
			description: `server port, remembered per repo (default: ${DEFAULT_PORT})`,
		},
		force: {
			type: /** @type {const} */ ('boolean'),
			short: 'f',
			default: false,
			description: 'clone over an existing db / close open connections',
		},
	},
}

/**
 * @typedef {object} ParsedArgs
 * @property {Command | null} command null when help is requested
 * @property {string[]} args positionals after the command
 * @property {string | undefined} db
 * @property {number | undefined} port
 * @property {boolean} force
 * @property {string} help
 */

/**
 * @param {string[]} argv usually `process.argv.slice(2)`
 * @returns {ParsedArgs}
 */
export function parseArgs(argv) {
	let parsed
	try {
		parsed = parseCli({ ...cliConfig, args: argv })
	} catch (e) {
		throw new Error(`${/** @type {Error} */ (e).message}\nRun "kitql-pg --help".`, { cause: e })
	}
	const { values, positionals, help } = parsed
	const [command, ...args] = positionals

	if (values.help || !command) {
		return { command: null, args: [], db: undefined, port: undefined, force: false, help }
	}
	if (!(command in COMMANDS)) {
		throw new Error(`Unknown command "${command}". Run "kitql-pg --help".`)
	}
	const cmd = /** @type {Command} */ (command)
	const [usage, , required] = COMMANDS[cmd]
	if (args.length < required) {
		throw new Error(`Missing argument: kitql-pg ${usage}`)
	}
	if (cmd !== 'psql' && args.length > (usage.includes('[') || required ? 1 : 0)) {
		throw new Error(`Too many arguments: kitql-pg ${usage}`)
	}

	let port
	if (values.port !== undefined) {
		port = Number(values.port)
		if (!Number.isInteger(port) || port < 1 || port > 65535) {
			throw new Error(`Invalid port "${values.port}"`)
		}
	}

	return {
		command: cmd,
		args,
		db: /** @type {string | undefined} */ (values.db),
		port,
		force: Boolean(values.force),
		help,
	}
}
