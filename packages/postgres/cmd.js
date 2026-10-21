#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { bold, cyan, gray, green, yellow } from '@kitql/helpers'

import { parseArgs } from './src/args.js'
import { findBinDir, installedBinDir } from './src/binaries.js'
import { syncEnvFile, syncEnvOrigin, webUrl } from './src/env.js'
import { dbName } from './src/naming.js'
import { resolveContext } from './src/paths.js'
import { skipMissingExtensions } from './src/restore.js'
import { follow, log, PgError, Server } from './src/server.js'
import { isListening, webPorts } from './src/web.js'

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

/**
 * Skip extensions this server doesn't ship (e.g. uuid-ossp), else the whole restore fails.
 * Returns a `pg_restore -L` list file, or undefined when nothing is skipped.
 * @param {Server} pg
 * @param {string} file
 */
function extensionFilter(pg, file) {
	const res = pg.exec('pg_restore', ['-l', file])
	if (res.status !== 0) {
		throw new PgError(`pg_restore -l failed: ${res.stderr.trim()}`)
	}
	const available = pg.sql('SELECT name FROM pg_available_extensions').map(([name]) => name)
	const { list, skipped } = skipMissingExtensions(res.stdout, available)
	if (skipped.length === 0) {
		return undefined
	}
	for (const ext of skipped) {
		log.info(yellow(`Skipping extension "${ext}": not available here, objects using it will fail`))
	}
	const listFile = path.join(os.tmpdir(), `kitql-pg-restore-${process.pid}.list`)
	fs.writeFileSync(listFile, list)
	return listFile
}

/** @param {import('./src/paths.js').Context} ctx */
function ownDb(ctx) {
	if (!ctx.ownDb) {
		throw new PgError(`This is the main checkout: its db is ${ctx.mainDb}, there is no "own" db.`)
	}
	return ctx.ownDb
}

/**
 * `my_app (main's db)`
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
 * Web ports of the worktrees (package.json "kitql-pg".web), this one synced to the .env ORIGIN
 * @param {import('./src/paths.js').Context} ctx
 * @param {import('./src/config.js').Config} config
 * @param {boolean} [quiet]
 */
function syncWeb(ctx, config, quiet = false) {
	if (!config.web) {
		return undefined
	}
	const web = webPorts(ctx, config.web)
	const res = syncEnvOrigin(ctx.root, web.ports[ctx.worktree])
	if (res && !quiet) {
		log.info(`.env ORIGIN: ${res.from} -> ${cyan(res.to)} ${yellow('(restart your dev server)')}`)
	}
	return { ...web, envChanged: Boolean(res) }
}

/**
 * Everything this worktree uses, and the other worktrees
 * @param {Server} pg
 * @param {import('./src/args.js').ParsedArgs} opts
 * @param {import('./src/config.js').Config} config
 */
async function status(pg, opts, config) {
	const { ctx } = pg
	const web = syncWeb(ctx, config, opts.json)
	const running = Boolean(pg.binDir) && pg.isRunning()
	const dbs = new Set(running ? pg.list().map((d) => d.name) : [])
	const db = currentDb(pg, opts)
	const port = web?.ports[ctx.worktree]
	const url = port ? webUrl(ctx.root, port) : undefined
	const worktrees = await Promise.all(
		(web?.worktrees ?? []).map(async (w) => {
			const own = w.name === 'main' ? undefined : dbName(ctx.mainDb, w.name)
			const p = web?.ports[w.name] ?? 0
			return {
				worktree: w.name,
				current: w.name === ctx.worktree,
				path: w.path,
				web: { port: p, url: webUrl(w.path, p), running: await isListening(p) },
				db: w.name === ctx.worktree ? db : own && dbs.has(own) ? own : ctx.mainDb,
			}
		}),
	)
	const data = {
		repo: ctx.repo,
		worktree: ctx.worktree,
		path: ctx.root,
		web: port ? { port, url, running: await isListening(port), envChanged: web?.envChanged } : null,
		db: {
			port: pg.port,
			name: db,
			own: db === ctx.ownDb,
			exists: dbs.has(db),
			running,
			url: pg.url(db),
		},
		links: url ? (config.links ?? []).map((l) => url + l) : [],
		logs: { db: ctx.logFile },
		worktrees,
	}
	if (opts.json) {
		console.info(JSON.stringify(data, null, 2))
		return 0
	}

	const state = (/** @type {boolean} */ on) => (on ? green('running') : gray('not running'))
	console.info(`${bold(ctx.repo)} ${gray('·')} ${cyan(ctx.worktree)} ${gray(ctx.root ?? '')}`)
	if (data.web) {
		console.info(`  web    ${green(data.web.url)}  ${state(data.web.running)}`)
	} else {
		console.info(gray(`  web    set a port in package.json "kitql-pg": { "web": 5173 }`))
	}
	console.info(
		`  db     ${label(ctx, db)} on port ${pg.port}  ${state(running)}` +
			(running && !data.db.exists ? yellow('  missing (kitql-pg init)') : ''),
	)
	console.info(`         ${gray('DATABASE_URL=')}${green(data.db.url)}`)
	for (const link of data.links) {
		console.info(`  link   ${link}`)
	}
	console.info(`  logs   db: ${ctx.logFile}`)
	if (worktrees.length > 1) {
		console.info(gray(`  worktrees (web port, db on port ${pg.port}):`))
		const width = Math.max(...worktrees.map((w) => w.worktree.length))
		for (const w of worktrees) {
			const name = w.worktree.padEnd(width)
			console.info(
				`  ${w.current ? green('*') : ' '} ${w.current ? bold(name) : name}  :${w.web.port}  ` +
					`${w.web.running ? green('running    ') : gray('not running')}  ${w.db}`,
			)
		}
	}
	return 0
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

	const { ctx, config } = resolveContext(process.cwd(), process.env)
	// url & status never download (install scripts, agents): without binaries, main's db
	const binDir =
		opts.command === 'url' || opts.command === 'status'
			? (installedBinDir() ?? '')
			: (await findBinDir()).binDir
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
			syncWeb(ctx, config)
			return up(pg, currentDb(pg, opts))

		case 'status':
			return status(pg, opts, config)

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
			const custom = magic.toString() === 'PGDMP'
			const listFile = custom ? extensionFilter(pg, file) : undefined
			const code = custom
				? await pg
						.interactive('pg_restore', [
							// all or nothing, and no WAL for the data (wal_level = minimal)
							'--single-transaction',
							'--clean',
							'--if-exists',
							'--no-owner',
							'--no-acl',
							...(listFile ? ['-L', listFile] : []),
							...pg.conn(db),
							file,
						])
						.finally(() => listFile && fs.rmSync(listFile, { force: true }))
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
