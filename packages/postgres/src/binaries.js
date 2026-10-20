import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { install } from './install.js'
import { PG_VERSION, TARGETS } from './platforms.js'

/** @typedef {'postgres' | 'initdb' | 'pg_ctl' | 'psql' | 'pg_dump' | 'pg_restore'} PgTool */

/**
 * @param {string} binDir
 * @param {PgTool} tool
 * @param {string} [platform]
 */
export function toolPath(binDir, tool, platform = process.platform) {
	return path.join(binDir, platform === 'win32' ? `${tool}.exe` : tool)
}

/**
 * Per-user cache shared by all projects (binaries only, every repo keeps its own server & data).
 * @param {{ env?: Record<string, string | undefined>, platform?: string, home?: string }} [opts]
 */
export function cacheRoot(opts = {}) {
	const env = opts.env ?? process.env
	const platform = opts.platform ?? process.platform
	const home = opts.home ?? os.homedir()
	if (env.KITQL_PG_CACHE) {
		return path.resolve(env.KITQL_PG_CACHE)
	}
	if (platform === 'win32') {
		return path.join(env.LOCALAPPDATA ?? path.join(home, 'AppData', 'Local'), 'kitql-postgres')
	}
	if (platform === 'darwin') {
		return path.join(home, 'Library', 'Caches', 'kitql-postgres')
	}
	return path.join(env.XDG_CACHE_HOME ?? path.join(home, '.cache'), 'kitql-postgres')
}

/**
 * Where are the PostgreSQL binaries?
 * 1. `KITQL_PG_BIN` env (a `bin` folder of any PostgreSQL install)
 * 2. the per-user cache, downloaded on first use (then it works offline)
 * @param {{ env?: Record<string, string | undefined>, platform?: string, arch?: string }} [opts]
 * @returns {Promise<{ binDir: string, source: string }>}
 */
export async function findBinDir(opts = {}) {
	const env = opts.env ?? process.env
	const platform = opts.platform ?? process.platform
	const arch = opts.arch ?? process.arch

	if (env.KITQL_PG_BIN) {
		const binDir = path.resolve(env.KITQL_PG_BIN)
		if (!fs.existsSync(toolPath(binDir, 'pg_ctl', platform))) {
			throw new Error(`KITQL_PG_BIN=${env.KITQL_PG_BIN} does not contain pg_ctl.`)
		}
		return { binDir, source: 'KITQL_PG_BIN' }
	}

	const key = `${platform}-${arch}`
	if (!(key in TARGETS)) {
		throw new Error(
			`No PostgreSQL build for ${key}. Supported: ${Object.keys(TARGETS).join(', ')}.\n` +
				`Install PostgreSQL yourself and set KITQL_PG_BIN=/path/to/postgres/bin`,
		)
	}
	const target = /** @type {import('./platforms.js').Target} */ (key)
	const dir = path.join(cacheRoot({ env, platform }), `${PG_VERSION}-${key}`)
	if (!fs.existsSync(path.join(dir, '.complete'))) {
		await install({ version: PG_VERSION, target, dir })
	}
	return { binDir: path.join(dir, 'bin'), source: dir }
}
