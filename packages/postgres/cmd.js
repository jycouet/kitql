#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

import { bold, cyan, gray, green, yellow } from '@kitql/helpers'

import { parseArgs } from './src/args.js'
import { findBinDir, installedBinDir } from './src/binaries.js'
import { readConfig } from './src/config.js'
import { syncEnvFile } from './src/env.js'
import { resolveContext } from './src/paths.js'
import { follow, log, PgError, Server } from './src/server.js'

/**
 * The database this worktree works with: `--db`, `--own`, else its own db if it exists, else
 * main's (shared by every worktree)
 * @param {Server} pg
 * @param {import('./src/args.js').ParsedArgs} opts
 */
function currentDb(pg, opts) {
	const { ctx } = pg
	if (opts.db) {
		return opts.db
	}
	if (opts.own) {
		return ownDb(ctx)
	}
	// without binaries (url from install scripts) or server, a worktree uses main's db
	if (ctx.ownDb && pg.binDir && pg.isRunning() && pg.exists(ctx.ownDb)) {
		return ctx.ownDb
	}
	return ctx.mainDb
}

/** @param {import('./src/paths.js').Context} ctx */
function ownDb(ctx) {
	if (!ctx.ownDb) {
		throw new PgError(`This is the main checkout: its db is ${ctx.mainDb}, there is no "own" db.`)
	}
	return ctx.ownDb
}

/**
 * `kimbia_app (main's db)`
 * @param {import('./src/paths.js').Context} ctx
 * @param {string} db
 */
function label(ctx, db) {
	if (db === ctx.mainDb) {
		return `${cyan(db)} ${gray("(main's db)")}`
	}
	if (db === ctx.ownDb) {
		return `${cyan(db)} ${gray("(this worktree's own db)")}`
	}
	return cyan(db)
}

/**
 * Point the checkout .env DATABASE_URL to `db` (only a url of this server)
 * @param {Server} pg
 * @param {string} db
 */
function syncEnv(pg, db) {
	const res = syncEnvFile(pg.ctx.root, pg.port, db)
	if (res) {
		log.info(`.env DATABASE_URL: ${res.from} -> ${cyan(db)} ${yellow('(restart your dev server)')}`)
	} else {
		printUrl(pg, db)
	}
}

/**
 * "up and running" + what to put in your .env
 * @param {Server} pg
 * @param {string} db
 * @param {string} state
 */
function ready(pg, db, state) {
	const version = pg.sql('SHOW server_version')[0]?.[0]
	log.success(
		`${cyan(pg.ctx.repo)} server ${state} ${gray(`(PostgreSQL ${version}, port ${pg.port}, ${pg.ctx.dataDir})`)}`,
	)
	if (pg.exists(db)) {
		log.info(`Database: ${label(pg.ctx, db)}`)
		printUrl(pg, db)
	} else {
		log.info(`${label(pg.ctx, db)} does not exist yet, create it with: ${cyan('kitql-pg init')}`)
	}
}

/**
 * @param {Server} pg
 * @param {string} db
 */
async function up(pg, db) {
	const created = pg.ensureCluster()
	if (pg.isRunning()) {
		ready(pg, db, 'already running (started elsewhere)')
		return 0
	}
	pg.start()
	ready(pg, db, created ? 'created, up and running' : 'up and running')
	log.info(gray('Ctrl+C to stop'))

	return await new Promise((resolve) => {
		let stopping = false
		const shutdown = () => {
			if (stopping) {
				return
			}
			stopping = true
			log.info('Stopping...')
			stopFollow()
			const ok = pg.stop()
			if (ok) {
				log.success('Server stopped.')
			} else {
				log.error('pg_ctl stop failed, see ' + pg.ctx.logFile)
			}
			resolve(ok ? 0 : 1)
		}
		const stopFollow = follow(
			pg.ctx.logFile,
			() => stopping || fs.existsSync(pg.pidFile),
			() => {
				if (!stopping) {
					log.error(`The server stopped outside of this terminal, see ${pg.ctx.logFile}`)
					resolve(1)
				}
			},
		)
		for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
			process.on(signal, shutdown)
		}
	})
}

/**
 * @param {Server} pg
 * @param {string} db
 */
function printUrl(pg, db) {
	console.info(`  ${gray('DATABASE_URL=')}${green(pg.url(db))}`)
}

/** @param {number} start */
function elapsed(start) {
	return `in ${((Date.now() - start) / 1000).toFixed(1)}s`
}

async function main() {
	const opts = parseArgs(process.argv.slice(2))
	if (!opts.command) {
		console.info(opts.help)
		return 0
	}

	const ctx = resolveContext(process.cwd(), process.env)
	const config = ctx.root ? readConfig(ctx.root) : {}
	// url never downloads (install scripts use it): without binaries, it gives main's db
	const binDir = opts.command === 'url' ? (installedBinDir() ?? '') : (await findBinDir()).binDir
	const pg = new Server(binDir, ctx, config)
	if (opts.port && opts.port !== pg.port) {
		if (opts.command !== 'up') {
			throw new PgError(`--port is set by "kitql-pg up" (current: ${pg.port}).`)
		}
		pg.setPort(opts.port)
	}
	const start = Date.now()

	switch (opts.command) {
		case 'up':
			return up(pg, currentDb(pg, opts))

		case 'stop':
			if (!pg.isRunning()) {
				log.info('The server is not running.')
				return 0
			}
			if (!pg.stop()) {
				throw new PgError(`pg_ctl stop failed, see ${ctx.logFile}`)
			}
			log.success('Server stopped.')
			return 0

		case 'url':
			console.info(pg.url(currentDb(pg, opts)))
			return 0

		case 'init': {
			pg.requireRunning()
			const db = currentDb(pg, opts)
			const created = pg.create(db, opts.tz)
			log.success(
				`${created ? 'Created' : 'Already there:'} ${label(ctx, db)} ${gray(`(timezone ${pg.timezone(db)})`)}`,
			)
			if (db === ctx.ownDb) {
				syncEnv(pg, db)
			} else {
				printUrl(pg, db)
			}
			return 0
		}

		case 'clone': {
			pg.requireRunning()
			const db = opts.db ?? ctx.ownDb ?? ctx.mainDb
			const source = pg.clone(opts.args[0], db, opts.force)
			log.success(
				`Cloned ${label(ctx, source)} into ${label(ctx, db)} ${gray(`(timezone ${pg.timezone(db)}) ${elapsed(start)}`)}`,
			)
			if (db === ctx.ownDb) {
				syncEnv(pg, db)
			} else {
				printUrl(pg, db)
			}
			return 0
		}

		case 'drop': {
			pg.requireRunning()
			const db = opts.db ?? ctx.ownDb ?? ctx.mainDb
			if (!pg.drop(db, opts.force)) {
				log.info(
					db === ctx.ownDb
						? `This worktree has no own db, it uses ${label(ctx, ctx.mainDb)}. Nothing to drop.`
						: `${cyan(db)} does not exist`,
				)
				return 0
			}
			log.success(`Dropped ${label(ctx, db)}`)
			if (db === ctx.ownDb) {
				syncEnv(pg, ctx.mainDb)
			}
			return 0
		}

		case 'ls': {
			pg.requireRunning()
			const db = currentDb(pg, opts)
			const dbs = pg.list()
			const width = Math.max(...dbs.map((d) => d.name.length))
			console.info(gray(`  ${ctx.repo} server on port ${pg.port} (${ctx.dataDir})`))
			for (const d of dbs) {
				const current = d.name === db
				const name = d.name.padEnd(width)
				const tag = d.name === ctx.mainDb ? gray("  main's") : ''
				console.info(
					`${current ? green('*') : ' '} ${current ? bold(name) : name}  ${d.size.padStart(8)}` +
						tag +
						(d.conns ? yellow(`  ${d.conns} connection(s)`) : ''),
				)
			}
			return 0
		}

		case 'dump': {
			pg.requireRunning()
			const db = currentDb(pg, opts)
			if (!pg.exists(db)) {
				throw new PgError(`"${db}" does not exist (kitql-pg init?)`)
			}
			const file = path.resolve(opts.args[0] ?? `${db}.dump`)
			// zstd (PG 16+): 4x faster than the default gzip, and smaller
			const zstd = pg.binaryMajor() >= 16 ? ['-Z', 'zstd'] : []
			const code = await pg.interactive('pg_dump', ['-Fc', ...zstd, '-f', file, ...pg.conn(db)])
			if (code !== 0) {
				throw new PgError(`pg_dump failed (exit ${code})`)
			}
			log.success(`Dumped ${label(ctx, db)} to ${cyan(file)} ${gray(elapsed(start))}`)
			return 0
		}

		case 'restore': {
			pg.requireRunning()
			const file = path.resolve(opts.args[0])
			if (!fs.existsSync(file)) {
				throw new PgError(`File not found: ${file}`)
			}
			const db = currentDb(pg, opts)
			if (!opts.db && !opts.own && ctx.ownDb && db === ctx.mainDb) {
				throw new PgError(
					`This worktree uses main's db (${ctx.mainDb}), shared by every worktree. Restore into:\n` +
						`  - this worktree's own db: kitql-pg restore <file> --own\n` +
						`  - main's db, for everyone: kitql-pg restore <file> --db ${ctx.mainDb}`,
				)
			}
			pg.assertNotProtected(db)
			pg.create(db)
			const fd = fs.openSync(file, 'r')
			const magic = Buffer.alloc(5)
			fs.readSync(fd, magic, 0, 5, 0)
			fs.closeSync(fd)
			const code =
				magic.toString() === 'PGDMP'
					? await pg.interactive('pg_restore', [
							// all or nothing, and no WAL for the data (wal_level = minimal)
							'--single-transaction',
							'--clean',
							'--if-exists',
							'--no-owner',
							'--no-acl',
							...pg.conn(db),
							file,
						])
					: await pg.interactive('psql', [
							'-X',
							'-q',
							'--single-transaction',
							'-v',
							'ON_ERROR_STOP=1',
							...pg.conn(db),
							'-f',
							file,
						])
			if (code !== 0) {
				throw new PgError(`Restore of ${file} into "${db}" failed (exit ${code})`)
			}
			log.success(`Restored ${cyan(file)} into ${label(ctx, db)} ${gray(elapsed(start))}`)
			if (db === ctx.ownDb) {
				syncEnv(pg, db)
			}
			return 0
		}

		case 'psql':
			pg.requireRunning()
			return pg.interactive('psql', [...pg.conn(currentDb(pg, opts)), ...opts.args])
	}
}

main().then(
	(code) => process.exit(code ?? 0),
	(/** @type {Error} */ e) => {
		// expected failures are plain messages, set DEBUG to see where the others come from
		log.error(process.env.DEBUG && !(e instanceof PgError) ? (e.stack ?? e.message) : e.message)
		process.exit(1)
	},
)
