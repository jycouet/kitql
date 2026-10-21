import { createHash } from 'node:crypto'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'

import { cacheRoot, findBinDir } from './binaries.js'
import { Server } from './server.js'

const PREFIX = 'kitql-pg-test-'
const OWNER = 'owner.pid'

// the data is thrown away at the end of the run: durability buys nothing, writes get ~2x faster
const TEST_CONF = ['fsync = off', 'full_page_writes = off']

/**
 * @typedef {object} TestServer
 * @property {number} port
 * @property {(db?: string) => string} url connection url of `db` (default: `postgres`)
 * @property {() => void} stop stops the server and deletes its data (idempotent)
 */

/** @returns {Promise<number>} */
function freePort() {
	return new Promise((resolve, reject) => {
		const srv = net.createServer()
		srv.on('error', reject)
		srv.listen(0, '127.0.0.1', () => {
			const { port } = /** @type {net.AddressInfo} */ (srv.address())
			srv.close(() => resolve(port))
		})
	})
}

/** @param {number} pid */
function alive(pid) {
	try {
		process.kill(pid, 0)
		return true
	} catch (e) {
		// EPERM: alive, owned by someone else
		return /** @type {NodeJS.ErrnoException} */ (e).code === 'EPERM'
	}
}

/**
 * @param {string} binDir
 * @param {string} home
 */
function testServer(binDir, home) {
	return new Server(binDir, {
		repo: 'test',
		worktree: 'main',
		mainDb: 'postgres',
		ownDb: undefined,
		commonDir: home,
		home,
		dataDir: path.join(home, 'data'),
		logFile: path.join(home, 'postgres.log'),
		stateFile: path.join(home, 'state.json'),
		root: undefined,
	})
}

/**
 * Servers of runs that died without stopping them (killed test runner): stopped, data deleted
 * @param {string} binDir
 */
function pruneStale(binDir) {
	const tmp = os.tmpdir()
	for (const name of fs.readdirSync(tmp)) {
		if (!name.startsWith(PREFIX)) {
			continue
		}
		const home = path.join(tmp, name)
		const owner = Number(fs.readFileSync(path.join(home, OWNER), { encoding: 'utf-8', flag: 'a+' }))
		if (owner && alive(owner)) {
			continue
		}
		const pg = testServer(binDir, home)
		if (pg.isRunning()) {
			pg.exec('pg_ctl', ['stop', '-D', pg.ctx.dataDir, '-m', 'immediate', '-w'])
		}
		fs.rmSync(home, { recursive: true, force: true })
	}
}

/**
 * A fresh cluster, made once per binaries and kept in the cache: initdb takes ~4s on Windows,
 * copying its result a fraction of that
 * @param {string} binDir
 */
function template(binDir) {
	const hash = createHash('sha1')
		.update(JSON.stringify([binDir, TEST_CONF]))
		.digest('hex')
		.slice(0, 8)
	const dir = path.join(cacheRoot(), `test-cluster-${hash}`)
	if (fs.existsSync(path.join(dir, 'PG_VERSION'))) {
		return dir
	}
	// built next to `dir`: a rename across filesystems (/tmp -> ~/.cache) fails with EXDEV
	fs.mkdirSync(path.dirname(dir), { recursive: true })
	const home = fs.mkdtempSync(`${dir}-`)
	const pg = testServer(binDir, home)
	pg.ensureCluster({ conf: TEST_CONF, quiet: true })
	try {
		fs.renameSync(pg.ctx.dataDir, dir)
	} catch (e) {
		if (!fs.existsSync(path.join(dir, 'PG_VERSION'))) {
			throw e
		}
		// another run made it first
	} finally {
		fs.rmSync(home, { recursive: true, force: true })
	}
	return dir
}

/**
 * A throwaway PostgreSQL server for tests: same binaries as `kitql-pg up`, its own temp data dir
 * and free port, no durability (`fsync = off`). Start it once per test run (a vitest
 * `globalSetup`), create a database per worker / file, `stop()` deletes everything.
 * @returns {Promise<TestServer>}
 */
export async function startTestServer() {
	const { binDir } = await findBinDir()
	pruneStale(binDir)
	const home = fs.mkdtempSync(path.join(os.tmpdir(), PREFIX))
	fs.writeFileSync(path.join(home, OWNER), String(process.pid))
	const pg = testServer(binDir, home)
	pg.port = await freePort()
	fs.cpSync(template(binDir), pg.ctx.dataDir, { recursive: true })
	// the copy is created with the umask (0755): postgres refuses to start on more than 0750
	fs.chmodSync(pg.ctx.dataDir, 0o700)
	pg.start()

	let stopped = false
	const stop = () => {
		if (stopped) {
			return
		}
		stopped = true
		process.off('exit', stop)
		pg.exec('pg_ctl', ['stop', '-D', pg.ctx.dataDir, '-m', 'immediate', '-w'])
		fs.rmSync(home, { recursive: true, force: true })
	}
	// a run that ends without calling stop() (error, Ctrl+C) still cleans up
	process.on('exit', stop)

	return { port: pg.port, url: (db = 'postgres') => pg.url(db), stop }
}
