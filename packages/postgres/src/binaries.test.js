import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { findBinDir, toolPath } from './binaries.js'
import { PG_VERSION, TARGETS } from './platforms.js'

const notFound = () => {
	throw new Error('not found')
}

describe('findBinDir', () => {
	it('unsupported platform', () => {
		expect(() =>
			findBinDir({ env: {}, platform: 'freebsd', arch: 'x64', resolve: notFound }),
		).toThrow('No bundled PostgreSQL for freebsd-x64')
	})

	it('missing platform package gives a clear message', () => {
		expect(() =>
			findBinDir({ env: {}, platform: 'linux', arch: 'arm64', resolve: notFound }),
		).toThrow(/"@kitql\/postgres-linux-arm64" is missing[\s\S]*KITQL_PG_BIN/)
	})

	it('package without binaries', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kitql-pg-'))
		expect(() =>
			findBinDir({
				env: {},
				platform: 'linux',
				arch: 'x64',
				resolve: () => path.join(dir, 'package.json'),
			}),
		).toThrow('has no binaries')
	})

	it('KITQL_PG_BIN override', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kitql-pg-'))
		expect(() => findBinDir({ env: { KITQL_PG_BIN: dir } })).toThrow('does not contain pg_ctl')
		fs.writeFileSync(toolPath(dir, 'pg_ctl'), '')
		expect(findBinDir({ env: { KITQL_PG_BIN: dir } })).toEqual({
			binDir: dir,
			source: 'KITQL_PG_BIN',
		})
	})

	it('tool names', () => {
		expect(toolPath('/b', 'psql', 'win32')).toBe(path.join('/b', 'psql.exe'))
		expect(toolPath('/b', 'psql', 'linux')).toBe(path.join('/b', 'psql'))
	})
})

describe('platforms', () => {
	it('PG_VERSION matches the postgres catalog', () => {
		const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
		const workspace = fs.readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf-8')
		for (const platform of Object.keys(TARGETS)) {
			expect(workspace).toContain(`'@kitql/postgres-${platform}': '${PG_VERSION}'`)
		}
	})
})
