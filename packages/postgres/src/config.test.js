import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { parseConfig, readConfig } from './config.js'
import { buildContext } from './paths.js'
import { Server } from './server.js'

/** @param {object} [pkg] package.json content */
function tmpRepo(pkg) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kitql-pg-'))
	if (pkg) {
		fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(pkg))
	}
	return root
}

describe('parseConfig', () => {
	it('port', () => {
		expect(parseConfig(undefined)).toEqual({})
		expect(parseConfig({})).toEqual({})
		expect(parseConfig({ port: 5435 })).toEqual({ port: 5435 })
	})

	it('web & links', () => {
		expect(parseConfig({ web: 7777, links: ['/?login-as=admin'] })).toEqual({
			web: 7777,
			links: ['/?login-as=admin'],
		})
		expect(() => parseConfig({ web: '7777' })).toThrow('"kitql-pg".web must be a port number')
		expect(() => parseConfig({ links: ['login'] })).toThrow('must be paths')
	})

	it('invalid', () => {
		expect(() => parseConfig('5435')).toThrow('must be an object')
		expect(() => parseConfig({ port: '5435' })).toThrow('must be a port number')
		expect(() => parseConfig({ port: 70000 })).toThrow('must be a port number')
	})
})

describe('readConfig', () => {
	it('reads the "kitql-pg" field of package.json', () => {
		expect(readConfig(tmpRepo({ name: 'x', 'kitql-pg': { port: 5435 } }))).toEqual({ port: 5435 })
		expect(readConfig(tmpRepo({ name: 'x' }))).toEqual({})
		expect(readConfig(tmpRepo())).toEqual({})
	})
})

describe('port', () => {
	const ctxOf = (/** @type {string} */ home) =>
		buildContext({ commonDir: '/r/.git', gitDir: '/r/.git' }, { KITQL_PG_HOME: home })

	it('local `up --port` > package.json > 5432', () => {
		const home = tmpRepo()
		expect(new Server('', ctxOf(home)).port).toBe(5432)
		expect(new Server('', ctxOf(home), { port: 5435 }).port).toBe(5435)
		new Server('', ctxOf(home)).setPort(5440)
		expect(new Server('', ctxOf(home), { port: 5435 }).port).toBe(5440)
	})
})
