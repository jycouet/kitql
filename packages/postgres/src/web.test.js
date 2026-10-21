import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildContext } from './paths.js'
import { assignWebPorts, isListening, listWorktrees, webPorts } from './web.js'

/** a repo with a main checkout and linked worktrees */
function tmpRepo(/** @type {string[]} */ worktrees) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kitql-pg-web-'))
	const commonDir = path.join(root, 'main', '.git')
	fs.mkdirSync(commonDir, { recursive: true })
	for (const name of worktrees) {
		const checkout = path.join(root, name)
		fs.mkdirSync(checkout)
		fs.writeFileSync(path.join(checkout, '.git'), `gitdir: ${commonDir}/worktrees/${name}`)
		fs.mkdirSync(path.join(commonDir, 'worktrees', name), { recursive: true })
		fs.writeFileSync(
			path.join(commonDir, 'worktrees', name, 'gitdir'),
			path.join(checkout, '.git') + '\n',
		)
	}
	return { root, commonDir }
}

describe('assignWebPorts', () => {
	it('main gets the base, others the next free ones', () => {
		expect(assignWebPorts({}, ['main', 'a', 'b'], 7777)).toEqual({ main: 7777, a: 7778, b: 7779 })
	})

	it('keeps given ports, reuses freed ones', () => {
		expect(assignWebPorts({ main: 7777, b: 7779, gone: 7778 }, ['main', 'b', 'c'], 7777)).toEqual({
			main: 7777,
			b: 7779,
			c: 7778,
		})
	})

	it('a new base moves main, drops ports at or below it', () => {
		expect(assignWebPorts({ main: 7777, a: 7778 }, ['main', 'a'], 8000)).toEqual({
			main: 8000,
			a: 8001,
		})
	})
})

describe('listWorktrees / webPorts', () => {
	it('main + linked worktrees, removed ones are skipped', () => {
		const { root, commonDir } = tmpRepo(['feat-a', 'fix-b'])
		fs.rmSync(path.join(root, 'fix-b'), { recursive: true })
		expect(listWorktrees(commonDir)).toEqual([
			{ name: 'main', path: path.join(root, 'main') },
			{ name: 'feat-a', path: path.join(root, 'feat-a') },
		])
	})

	it('stores the ports, stable across calls', () => {
		const { commonDir } = tmpRepo(['feat-a', 'fix-b'])
		const ctx = buildContext({ commonDir, gitDir: path.join(commonDir, 'worktrees', 'fix-b') })
		expect(webPorts(ctx, 5173).ports).toEqual({ main: 5173, 'feat-a': 5174, 'fix-b': 5175 })
		expect(JSON.parse(fs.readFileSync(path.join(ctx.home, 'web.json'), 'utf-8'))).toEqual({
			main: 5173,
			'feat-a': 5174,
			'fix-b': 5175,
		})
		expect(webPorts(ctx, 5173).ports['fix-b']).toBe(5175)
	})
})

describe('isListening', () => {
	it('true while a server listens', async () => {
		const server = net.createServer().listen(0, '127.0.0.1')
		await new Promise((r) => server.once('listening', r))
		const { port } = /** @type {net.AddressInfo} */ (server.address())
		expect(await isListening(port)).toBe(true)
		await new Promise((r) => server.close(r))
		expect(await isListening(port)).toBe(false)
	})
})
