import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { platformPackageName, TARGETS } from './platforms.js'

const require = createRequire(import.meta.url)

/** @typedef {'postgres' | 'initdb' | 'pg_ctl' | 'psql' | 'pg_dump' | 'pg_restore'} PgTool */

/**
 * @param {string} binDir
 * @param {PgTool} tool
 * @param {NodeJS.Platform} [platform]
 */
export function toolPath(binDir, tool, platform = process.platform) {
	return path.join(binDir, platform === 'win32' ? `${tool}.exe` : tool)
}

/**
 * Where are the PostgreSQL binaries?
 * 1. `KITQL_PG_BIN` env (a `bin` folder of any PostgreSQL install, e.g. the system one)
 * 2. the `@kitql/postgres-<platform>-<arch>` optional dependency
 * Never downloads anything: installs stay offline-friendly (esbuild style).
 * @param {{ env?: Record<string, string | undefined>, platform?: string, arch?: string, resolve?: (id: string) => string }} [opts]
 * @returns {{ binDir: string, source: string }}
 */
export function findBinDir(opts = {}) {
	const env = opts.env ?? process.env
	const platform = opts.platform ?? process.platform
	const arch = opts.arch ?? process.arch
	const resolve = opts.resolve ?? require.resolve

	if (env.KITQL_PG_BIN) {
		const binDir = path.resolve(env.KITQL_PG_BIN)
		if (!fs.existsSync(toolPath(binDir, 'pg_ctl', /** @type {NodeJS.Platform} */ (platform)))) {
			throw new Error(`KITQL_PG_BIN=${env.KITQL_PG_BIN} does not contain pg_ctl.`)
		}
		return { binDir, source: 'KITQL_PG_BIN' }
	}

	const key = `${platform}-${arch}`
	if (!(key in TARGETS)) {
		throw new Error(
			`No bundled PostgreSQL for ${key}. Supported: ${Object.keys(TARGETS).join(', ')}.\n` +
				`Install PostgreSQL yourself and set KITQL_PG_BIN=/path/to/postgres/bin`,
		)
	}

	const pkg = platformPackageName(key)
	let pkgDir
	try {
		pkgDir = path.dirname(resolve(`${pkg}/package.json`))
	} catch {
		throw new Error(
			`The package "${pkg}" is missing, it holds the PostgreSQL binaries for ${key}.\n` +
				`It is an optionalDependency of @kitql/postgres, so it may have been skipped:\n` +
				`  - installed with --no-optional / --omit=optional?\n` +
				`  - node_modules or lockfile copied from another OS / arch?\n` +
				`Reinstall your dependencies, or set KITQL_PG_BIN=/path/to/postgres/bin to use another install.`,
		)
	}
	const binDir = path.join(pkgDir, 'bin')
	if (!fs.existsSync(toolPath(binDir, 'pg_ctl', /** @type {NodeJS.Platform} */ (platform)))) {
		throw new Error(
			`"${pkg}" is installed but has no binaries in ${binDir}.\n` +
				`In the kitql repo, generate them with: pnpm -F @kitql/postgres platforms --target ${key}`,
		)
	}
	return { binDir, source: pkg }
}

/**
 * npm tarballs can lose the executable bit, put it back if needed (no-op on Windows).
 * @param {string} binDir
 */
export function ensureExecutable(binDir) {
	if (process.platform === 'win32') {
		return
	}
	for (const tool of /** @type {PgTool[]} */ ([
		'postgres',
		'initdb',
		'pg_ctl',
		'psql',
		'pg_dump',
		'pg_restore',
	])) {
		const file = toolPath(binDir, tool)
		try {
			fs.accessSync(file, fs.constants.X_OK)
		} catch {
			try {
				fs.chmodSync(file, 0o755)
			} catch {
				// read-only store: the spawn error will tell
			}
		}
	}
}
