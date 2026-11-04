import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { appOf, findApps, parseConfig, readConfig } from './config.js'
import { appContext, buildContext } from './paths.js'
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

	it('db', () => {
		expect(parseConfig({ db: 'my_app' })).toEqual({ db: 'my_app' })
		expect(parseConfig({ db: 'my-app' })).toEqual({ db: 'my-app' })
		expect(() => parseConfig({ db: 'My-App' })).toThrow('lowercase name')
		expect(() => parseConfig({ db: '' })).toThrow('lowercase name')
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

describe('apps', () => {
	/** @param {Record<string, object>} pkgs dir -> package.json */
	function monorepo(pkgs) {
		const root = tmpRepo({ name: 'mono', 'kitql-pg': { port: 5433 } })
		for (const [dir, pkg] of Object.entries(pkgs)) {
			fs.mkdirSync(path.join(root, dir), { recursive: true })
			fs.writeFileSync(path.join(root, dir, 'package.json'), JSON.stringify(pkg))
		}
		return root
	}

	it('finds the apps with a "kitql-pg" field, one or two folders deep', () => {
		const root = monorepo({
			'apps/capa': { 'kitql-pg': { db: 'my-capa', web: 3179 } },
			'apps/cadb': { 'kitql-pg': { db: 'my-cadb', web: 3177 } },
			'packages/lib': { name: 'lib' },
			'node_modules/x': { 'kitql-pg': {} },
		})
		const apps = findApps(root)
		expect(apps.map((a) => a.dir)).toEqual(['apps/cadb', 'apps/capa'])
		expect(appOf(apps, root, path.join(root, 'apps', 'capa', 'src'))?.name).toBe('capa')
		expect(appOf(apps, root, root)).toBeUndefined()
	})

	it('the port belongs to the root', () => {
		const root = monorepo({ 'apps/a': { 'kitql-pg': { port: 5440 } } })
		expect(() => findApps(root)).toThrow('set the port in the root package.json')
	})

	it('app context: its db, own db, .env folder', () => {
		const ctx = buildContext({
			commonDir: '/r/.git',
			gitDir: '/r/.git/worktrees/feat-x',
			toplevel: '/wt/feat-x',
		})
		const app = { name: 'capa', dir: 'apps/capa', config: { db: 'my-capa' } }
		expect(appContext(ctx, app)).toMatchObject({
			mainDb: 'my-capa',
			ownDb: 'my_capa_feat_x',
			root: path.join('/wt/feat-x', 'apps/capa'),
			app: 'apps/capa',
		})
		expect(appContext(ctx, { ...app, config: {} }).mainDb).toBe('r_capa')
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
