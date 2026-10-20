import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { cyan, gray, Log } from '@kitql/helpers'

import { DEFAULT_PORT } from './args.js'
import { toolPath } from './binaries.js'
import { dbName, PROTECTED_DBS, quoteIdent, quoteLiteral } from './naming.js'

export const log = new Log('kitql-pg')

const USER = 'postgres'
const HOST = 'localhost'
const CONF_MARKER = '# --- kitql-pg ---'
const NEW_LINE = /\r?\n/
const VERSION = /(\d+)(?:\.\d+)?/
const BUSY = /being accessed by other users/
const PG_ENV = /^PG(HOST|PORT|USER|DATABASE|PASSWORD|SERVICE|DATA|OPTIONS)/

/** An error to show as-is (no stack) */
export class PgError extends Error {}

export class Server {
	/**
	 * @param {string} binDir
	 * @param {import('./paths.js').Context} ctx
	 */
	constructor(binDir, ctx) {
		this.binDir = binDir
		this.ctx = ctx
		this.port = this.readState().port
	}

	/** @returns {{ port: number }} */
	readState() {
		try {
			return { port: DEFAULT_PORT, ...JSON.parse(fs.readFileSync(this.ctx.stateFile, 'utf-8')) }
		} catch {
			return { port: DEFAULT_PORT }
		}
	}

	/** @param {number} port */
	setPort(port) {
		this.port = port
		fs.mkdirSync(this.ctx.home, { recursive: true })
		fs.writeFileSync(
			this.ctx.stateFile,
			JSON.stringify({ ...this.readState(), port }, null, 2) + '\n',
		)
	}

	/** @param {string} db */
	url(db) {
		return `postgres://${USER}:${USER}@${HOST}:${this.port}/${db}`
	}

	/** @param {import('./binaries.js').PgTool} tool */
	tool(tool) {
		return toolPath(this.binDir, tool)
	}

	/** connection flags of client tools */
	conn(/** @type {string} */ db) {
		return ['-h', HOST, '-p', String(this.port), '-U', USER, '-d', db]
	}

	/**
	 * @param {import('./binaries.js').PgTool} tool
	 * @param {string[]} args
	 * @param {{ capture?: boolean }} [opts]
	 */
	exec(tool, args, { capture = true } = {}) {
		const res = spawnSync(this.tool(tool), args, {
			encoding: 'utf-8',
			env: clientEnv(),
			stdio: capture ? 'pipe' : 'ignore',
		})
		if (res.error) {
			throw new PgError(`Could not run ${tool}: ${res.error.message}`)
		}
		return res
	}

	/**
	 * Run tool with inherited stdio, async so Ctrl+C reaches the child (psql cancels the query) and not us.
	 * @param {import('./binaries.js').PgTool} tool
	 * @param {string[]} args
	 * @returns {Promise<number>}
	 */
	interactive(tool, args) {
		const ignore = () => {}
		process.on('SIGINT', ignore)
		return new Promise((resolve, reject) => {
			const child = spawn(this.tool(tool), args, { stdio: 'inherit', env: clientEnv() })
			child.on('error', reject)
			child.on('close', (code) => resolve(code ?? 1))
		}).finally(() => process.off('SIGINT', ignore))
	}

	/**
	 * Run sql through psql, returns rows (columns split on `|`)
	 * @param {string} query
	 * @param {string} [db]
	 */
	sql(query, db = 'postgres') {
		const res = this.exec('psql', [
			'-X',
			'-q',
			'-A',
			'-t',
			'-v',
			'ON_ERROR_STOP=1',
			...this.conn(db),
			'-c',
			query,
		])
		if (res.status !== 0) {
			throw new PgError((res.stderr || res.stdout).trim().replace(/^psql:\S*\s*/gm, ''))
		}
		return res.stdout
			.split(NEW_LINE)
			.filter((l) => l !== '')
			.map((l) => l.split('|'))
	}

	// ---------------------------------------------------------------- cluster

	get pidFile() {
		return path.join(this.ctx.dataDir, 'postmaster.pid')
	}

	isRunning() {
		if (!fs.existsSync(this.pidFile)) {
			return false
		}
		return this.exec('pg_ctl', ['status', '-D', this.ctx.dataDir]).status === 0
	}

	requireRunning() {
		if (!fs.existsSync(path.join(this.ctx.dataDir, 'PG_VERSION'))) {
			throw new PgError(`No server yet for "${this.ctx.repo}". Start it with: kitql-pg up`)
		}
		if (!this.isRunning()) {
			throw new PgError(
				`The "${this.ctx.repo}" server is not running. Start it with: kitql-pg up (from any worktree)`,
			)
		}
	}

	binaryMajor() {
		const out = this.exec('pg_ctl', ['--version']).stdout
		const major = Number(VERSION.exec(out)?.[1])
		if (!major) {
			throw new PgError(`Could not read the version of ${this.tool('pg_ctl')}: ${out}`)
		}
		return major
	}

	/** initdb the repo cluster when needed */
	ensureCluster() {
		const major = this.binaryMajor()
		const versionFile = path.join(this.ctx.dataDir, 'PG_VERSION')
		if (fs.existsSync(versionFile)) {
			const dataMajor = Number(fs.readFileSync(versionFile, 'utf-8').trim())
			if (dataMajor !== major) {
				throw new PgError(
					`The data dir was created by PostgreSQL ${dataMajor} but the binaries are ${major}.\n` +
						`Dump your databases with the old version, delete ${this.ctx.dataDir}, then restore.`,
				)
			}
			return false
		}

		log.info(`Creating the ${cyan(this.ctx.repo)} cluster in ${gray(this.ctx.dataDir)}`)
		fs.mkdirSync(this.ctx.home, { recursive: true })
		const args = [
			'-D',
			this.ctx.dataDir,
			'-U',
			USER,
			'--auth=trust',
			'-E',
			'UTF8',
			'--no-instructions',
		]
		if (major >= 17) {
			// same collation behavior on every OS
			args.push('--locale-provider=builtin', '--builtin-locale=C.UTF-8', '--locale=C')
		} else {
			args.push('--no-locale')
		}
		const res = this.exec('initdb', args)
		if (res.status !== 0) {
			throw new PgError(`initdb failed:\n${res.stdout}\n${res.stderr}`)
		}
		fs.appendFileSync(
			path.join(this.ctx.dataDir, 'postgresql.conf'),
			[
				'',
				CONF_MARKER,
				"listen_addresses = 'localhost'",
				"unix_socket_directories = ''",
				"timezone = 'UTC'",
				"log_timezone = 'UTC'",
				'',
			].join('\n'),
		)
		return true
	}

	start() {
		const res = this.exec(
			'pg_ctl',
			[
				'start',
				'-D',
				this.ctx.dataDir,
				'-l',
				this.ctx.logFile,
				'-w',
				'-t',
				'60',
				'-o',
				`-p ${this.port}`,
			],
			// the server inherits pg_ctl handles: piping them would keep us waiting until it stops
			{ capture: false },
		)
		if (res.status !== 0) {
			throw new PgError(
				`pg_ctl start failed (port ${this.port} already in use? try --port). Server log:\n` +
					gray(tail(this.ctx.logFile, 15)),
			)
		}
	}

	stop() {
		const res = this.exec('pg_ctl', ['stop', '-D', this.ctx.dataDir, '-m', 'fast', '-w', '-t', '60'])
		return res.status === 0
	}

	// ---------------------------------------------------------------- dbs

	/** @param {string} db */
	exists(db) {
		return this.sql(`SELECT 1 FROM pg_database WHERE datname = ${quoteLiteral(db)}`).length > 0
	}

	/** @param {string} db */
	connections(db) {
		return this.sql(
			`SELECT pid, coalesce(nullif(application_name, ''), '?') FROM pg_stat_activity ` +
				`WHERE datname = ${quoteLiteral(db)} AND pid <> pg_backend_pid()`,
		).map(([pid, app]) => ({ pid: Number(pid), app }))
	}

	/** @param {string} db */
	terminate(db) {
		this.sql(
			`SELECT pg_terminate_backend(pid) FROM pg_stat_activity ` +
				`WHERE datname = ${quoteLiteral(db)} AND pid <> pg_backend_pid()`,
		)
	}

	/** @param {string} db */
	setUtc(db) {
		this.sql(`ALTER DATABASE ${quoteIdent(db)} SET timezone TO 'UTC'`)
	}

	/** @param {string} db */
	create(db) {
		if (this.exists(db)) {
			this.setUtc(db)
			return false
		}
		this.sql(`CREATE DATABASE ${quoteIdent(db)}`)
		this.setUtc(db)
		return true
	}

	/**
	 * Database name from a db name or a worktree name of the repo
	 * @param {string} nameOrWorktree
	 */
	resolveDb(nameOrWorktree) {
		if (this.exists(nameOrWorktree)) {
			return nameOrWorktree
		}
		const candidate = dbName(this.ctx.repo, nameOrWorktree)
		if (this.exists(candidate)) {
			return candidate
		}
		throw new PgError(
			`No database "${nameOrWorktree}" (nor "${candidate}"). See them with: kitql-pg ls`,
		)
	}

	/** @param {string} db */
	assertNotProtected(db) {
		if (PROTECTED_DBS.includes(db)) {
			throw new PgError(`"${db}" is a system database, kitql-pg will not touch it.`)
		}
	}

	/**
	 * @param {string} from
	 * @param {string} to
	 * @param {boolean} force
	 */
	clone(from, to, force) {
		const source = this.resolveDb(from)
		if (source === to) {
			throw new PgError(`Source and target are the same database ("${to}").`)
		}
		this.assertNotProtected(to)

		const conns = this.connections(source)
		if (conns.length > 0) {
			if (!force) {
				throw new PgError(
					`"${source}" has ${conns.length} open connection(s) (${[...new Set(conns.map((c) => c.app))].join(', ')}).\n` +
						`Cloning uses it as a template, so nobody can be connected: stop the app / psql using it,\n` +
						`or re-run with --force to close those connections.`,
				)
			}
			this.terminate(source)
		}

		if (this.exists(to)) {
			if (!force) {
				throw new PgError(`"${to}" already exists. Re-run with --force to replace it.`)
			}
			this.sql(`DROP DATABASE ${quoteIdent(to)} WITH (FORCE)`)
		}

		try {
			this.sql(`CREATE DATABASE ${quoteIdent(to)} TEMPLATE ${quoteIdent(source)}`)
		} catch (e) {
			if (BUSY.test(/** @type {Error} */ (e).message)) {
				throw new PgError(
					`"${source}" got a new connection during the clone. Stop what uses it (or use --force) and retry.`,
				)
			}
			throw e
		}
		// per-database settings are not copied by TEMPLATE
		this.setUtc(to)
		return source
	}

	/**
	 * @param {string} db
	 * @param {boolean} force
	 */
	drop(db, force) {
		this.assertNotProtected(db)
		if (!this.exists(db)) {
			return false
		}
		try {
			this.sql(`DROP DATABASE ${quoteIdent(db)}${force ? ' WITH (FORCE)' : ''}`)
		} catch (e) {
			if (BUSY.test(/** @type {Error} */ (e).message)) {
				throw new PgError(`"${db}" has open connections. Close them, or re-run with --force.`)
			}
			throw e
		}
		return true
	}

	list() {
		return this.sql(
			`SELECT d.datname, pg_size_pretty(pg_database_size(d.datname)), ` +
				`(SELECT count(*) FROM pg_stat_activity a WHERE a.datname = d.datname AND a.pid <> pg_backend_pid()) ` +
				`FROM pg_database d WHERE NOT d.datistemplate ORDER BY 1`,
		).map(([name, size, conns]) => ({ name, size, conns: Number(conns) }))
	}
}

/** client env without PG* vars that could redirect the tools elsewhere */
function clientEnv() {
	/** @type {Record<string, string | undefined>} */
	const env = { ...process.env }
	for (const key of Object.keys(env)) {
		if (PG_ENV.test(key)) {
			delete env[key]
		}
	}
	return env
}

/**
 * Last lines of a file
 * @param {string} file
 * @param {number} lines
 */
export function tail(file, lines) {
	try {
		return fs.readFileSync(file, 'utf-8').trimEnd().split(NEW_LINE).slice(-lines).join('\n')
	} catch {
		return ''
	}
}

/**
 * Stream new content of a file to stdout until stopped
 * @param {string} file
 * @param {() => boolean} keepGoing called on each tick
 * @param {() => void} onEnd
 */
export function follow(file, keepGoing, onEnd) {
	let pos = fs.existsSync(file) ? fs.statSync(file).size : 0
	const timer = setInterval(() => {
		try {
			const size = fs.statSync(file).size
			if (size > pos) {
				const fd = fs.openSync(file, 'r')
				const buf = Buffer.alloc(size - pos)
				fs.readSync(fd, buf, 0, buf.length, pos)
				fs.closeSync(fd)
				process.stdout.write(gray(buf.toString('utf-8')))
				pos = size
			} else if (size < pos) {
				pos = 0
			}
		} catch {
			// log not there yet
		}
		if (!keepGoing()) {
			clearInterval(timer)
			onEnd()
		}
	}, 300)
	return () => clearInterval(timer)
}
