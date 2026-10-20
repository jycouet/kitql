import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { cacheRoot, findBinDir, toolPath } from './binaries.js'
import { PG_VERSION, TARGETS } from './platforms.js'

describe('findBinDir', () => {
	it('unsupported platform', async () => {
		await expect(findBinDir({ env: {}, platform: 'freebsd', arch: 'x64' })).rejects.toThrow(
			'No PostgreSQL build for freebsd-x64',
		)
	})

	it('KITQL_PG_BIN override', async () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kitql-pg-'))
		await expect(findBinDir({ env: { KITQL_PG_BIN: dir } })).rejects.toThrow(
			'does not contain pg_ctl',
		)
		fs.writeFileSync(toolPath(dir, 'pg_ctl'), '')
		await expect(findBinDir({ env: { KITQL_PG_BIN: dir } })).resolves.toEqual({
			binDir: dir,
			source: 'KITQL_PG_BIN',
		})
	})

	it('uses the cache when already installed (no download)', async () => {
		const cache = fs.mkdtempSync(path.join(os.tmpdir(), 'kitql-pg-'))
		const dir = path.join(cache, `${PG_VERSION}-linux-x64`)
		fs.mkdirSync(dir)
		fs.writeFileSync(path.join(dir, '.complete'), '')
		await expect(
			findBinDir({ env: { KITQL_PG_CACHE: cache }, platform: 'linux', arch: 'x64' }),
		).resolves.toEqual({ binDir: path.join(dir, 'bin'), source: dir })
	})

	it('tool names', () => {
		expect(toolPath('/b', 'psql', 'win32')).toBe(path.join('/b', 'psql.exe'))
		expect(toolPath('/b', 'psql', 'linux')).toBe(path.join('/b', 'psql'))
	})
})

describe('cacheRoot', () => {
	it('per OS', () => {
		expect(cacheRoot({ env: { LOCALAPPDATA: 'C:/L' }, platform: 'win32', home: '/h' })).toBe(
			path.join('C:/L', 'kitql-postgres'),
		)
		expect(cacheRoot({ env: {}, platform: 'darwin', home: '/h' })).toBe(
			path.join('/h', 'Library', 'Caches', 'kitql-postgres'),
		)
		expect(cacheRoot({ env: {}, platform: 'linux', home: '/h' })).toBe(
			path.join('/h', '.cache', 'kitql-postgres'),
		)
		expect(cacheRoot({ env: { XDG_CACHE_HOME: '/x' }, platform: 'linux', home: '/h' })).toBe(
			path.join('/x', 'kitql-postgres'),
		)
	})

	it('KITQL_PG_CACHE override', () => {
		expect(cacheRoot({ env: { KITQL_PG_CACHE: '/c' }, platform: 'linux' })).toBe(path.resolve('/c'))
	})
})

describe('platforms', () => {
	it('every target has a sha256', () => {
		for (const { sha256 } of Object.values(TARGETS)) {
			expect(sha256).toMatch(/^[0-9a-f]{64}$/)
		}
	})
})
