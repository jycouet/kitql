#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

import { bold, cyan, gray, green, yellow } from '@kitql/helpers'

import { parseArgs } from './src/args.js'
import { ensureExecutable, findBinDir } from './src/binaries.js'
import { resolveContext } from './src/paths.js'
import { follow, log, PgError, Server } from './src/server.js'

/** @param {Server} pg */
async function up(pg) {
	const created = pg.ensureCluster()
	if (pg.isRunning()) {
		log.info(
			`The ${cyan(pg.ctx.repo)} server is already running on port ${cyan(pg.port)} (started elsewhere).`,
		)
		return 0
	}
	pg.start()
	log.success(
		`${created ? 'Created and started' : 'Started'} the ${cyan(pg.ctx.repo)} server on port ${cyan(pg.port)} ` +
			gray(`(${pg.ctx.dataDir})`),
	)
	log.info(
		`Create this worktree's database with ${cyan('kitql-postgres init')}  ${gray('Ctrl+C to stop')}`,
	)

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

async function main() {
	const opts = parseArgs(process.argv.slice(2))
	if (!opts.command) {
		console.info(opts.help)
		return 0
	}

	const ctx = resolveContext(process.cwd(), process.env)
	const { binDir } = findBinDir()
	ensureExecutable(binDir)
	const pg = new Server(binDir, ctx)
	if (opts.port && opts.port !== pg.port) {
		if (opts.command !== 'up') {
			throw new PgError(`--port is set by "kitql-postgres up" (current: ${pg.port}).`)
		}
		pg.setPort(opts.port)
	}
	const db = opts.db ?? ctx.db

	switch (opts.command) {
		case 'up':
			return up(pg)

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
			console.info(pg.url(db))
			return 0

		case 'init': {
			pg.requireRunning()
			const created = pg.create(db)
			log.success(`${created ? 'Created' : 'Already there:'} ${cyan(db)} ${gray('(timezone UTC)')}`)
			printUrl(pg, db)
			return 0
		}

		case 'clone': {
			pg.requireRunning()
			const source = pg.clone(opts.args[0], db, opts.force)
			log.success(`Cloned ${cyan(source)} into ${cyan(db)}`)
			printUrl(pg, db)
			return 0
		}

		case 'drop':
			pg.requireRunning()
			if (pg.drop(db, opts.force)) {
				log.success(`Dropped ${cyan(db)}`)
			} else {
				log.info(`${cyan(db)} does not exist`)
			}
			return 0

		case 'ls': {
			pg.requireRunning()
			const dbs = pg.list()
			const width = Math.max(...dbs.map((d) => d.name.length))
			console.info(gray(`  ${ctx.repo} server on port ${pg.port} (${ctx.dataDir})`))
			for (const d of dbs) {
				const current = d.name === db
				const name = d.name.padEnd(width)
				console.info(
					`${current ? green('*') : ' '} ${current ? bold(name) : name}  ${d.size.padStart(8)}` +
						(d.conns ? yellow(`  ${d.conns} connection(s)`) : ''),
				)
			}
			return 0
		}

		case 'dump': {
			pg.requireRunning()
			if (!pg.exists(db)) {
				throw new PgError(`"${db}" does not exist (kitql-postgres init?)`)
			}
			const file = path.resolve(opts.args[0] ?? `${db}.dump`)
			const code = await pg.interactive('pg_dump', ['-Fc', '-f', file, ...pg.conn(db)])
			if (code !== 0) {
				throw new PgError(`pg_dump failed (exit ${code})`)
			}
			log.success(`Dumped ${cyan(db)} to ${cyan(file)}`)
			return 0
		}

		case 'restore': {
			pg.requireRunning()
			const file = path.resolve(opts.args[0])
			if (!fs.existsSync(file)) {
				throw new PgError(`File not found: ${file}`)
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
							'-v',
							'ON_ERROR_STOP=1',
							...pg.conn(db),
							'-f',
							file,
						])
			if (code !== 0) {
				throw new PgError(`Restore of ${file} into "${db}" failed (exit ${code})`)
			}
			log.success(`Restored ${cyan(file)} into ${cyan(db)}`)
			return 0
		}

		case 'psql':
			pg.requireRunning()
			return pg.interactive('psql', [...pg.conn(db), ...opts.args])
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
