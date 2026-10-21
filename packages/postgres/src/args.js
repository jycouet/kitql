import { parseCli } from '@kitql/helpers/server'

export const DEFAULT_PORT = 5432

/** command -> [usage, description, required positionals] */
export const COMMANDS = /** @type {const} */ ({
	up: ['up', 'start the repo server in the foreground (Ctrl+C stops it)', 0],
	stop: ['stop', 'stop the repo server (if `up` was killed)', 0],
	init: ['init', 'create the database if needed (idempotent, timezone UTC)', 0],
	clone: ['clone <from>', 'give this worktree its own db, a copy of <from> (main, worktree, db)', 1],
	drop: ['drop', "drop this worktree's own db (it goes back to main's)", 0],
	ls: ['ls', 'list databases of the server', 0],
	dump: ['dump [file]', 'pg_dump the database (default: <db>.dump)', 0],
	restore: ['restore <file>', 'restore a dump (.dump or .sql), all or nothing', 1],
	psql: ['psql [-- args]', 'open psql on the database', 0],
	url: ['url', 'print the connection url of the database', 0],
	status: ['status', 'what this worktree uses (web port, db, links, logs) and the others', 0],
})

/** @typedef {keyof typeof COMMANDS} Command */

const cliConfig = {
	name: 'kitql-pg',
	description: [
		"Local PostgreSQL: one server per repo. Worktrees use main's database, or their own one.",
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
			description: "target database (default: the worktree's own db if any, else main's)",
		},
		own: {
			type: /** @type {const} */ ('boolean'),
			short: 'o',
			default: false,
			description: "target this worktree's own db (init / restore create it)",
		},
		port: {
			type: /** @type {const} */ ('string'),
			short: 'p',
			description: `server port, remembered per repo (default: ${DEFAULT_PORT})`,
		},
		tz: {
			type: /** @type {const} */ ('string'),
			description: 'timezone of the database, on init (default: UTC, then kept)',
		},
		force: {
			type: /** @type {const} */ ('boolean'),
			short: 'f',
			default: false,
			description: 'clone over an existing db / close open connections',
		},
		json: {
			type: /** @type {const} */ ('boolean'),
			default: false,
			description: 'status as JSON (for scripts and agents)',
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
 * @property {boolean} own
 * @property {string | undefined} tz
 * @property {boolean} json
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
		return {
			command: null,
			args: [],
			db: undefined,
			port: undefined,
			force: false,
			own: false,
			tz: undefined,
			json: false,
			help,
		}
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
		own: Boolean(values.own),
		tz: /** @type {string | undefined} */ (values.tz),
		json: Boolean(values.json),
		help,
	}
}
