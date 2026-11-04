import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'

import { sanitize } from './naming.js'

/**
 * @typedef {object} Worktree
 * @property {string} name `main`, or the git worktree name
 * @property {string} path its checkout
 */

/**
 * Checkouts of the repo, from the git common dir
 * @param {string} commonDir
 * @returns {Worktree[]}
 */
export function listWorktrees(commonDir) {
	/** @type {Worktree[]} */
	const list = []
	if (path.basename(commonDir) === '.git') {
		list.push({ name: 'main', path: path.dirname(commonDir) })
	}
	const dir = path.join(commonDir, 'worktrees')
	for (const name of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) {
		try {
			const gitdir = fs.readFileSync(path.join(dir, name, 'gitdir'), 'utf-8').trim()
			if (fs.existsSync(gitdir)) {
				list.push({ name, path: path.dirname(path.resolve(gitdir)) })
			}
		} catch {
			// half removed worktree
		}
	}
	return list
}

/**
 * Web port of every worktree: `main` gets `base`, the others the lowest free port above it.
 * A given port is kept (bookmarks, OAuth callbacks), removed worktrees free theirs.
 * @param {Record<string, number>} given worktree -> port
 * @param {string[]} worktrees
 * @param {number} base
 * @param {Iterable<number>} [reserved] ports of the other apps of the repo
 * @returns {Record<string, number>}
 */
export function assignWebPorts(given, worktrees, base, reserved = []) {
	const others = new Set(reserved)
	/** @type {Record<string, number>} */
	const ports = {}
	for (const name of worktrees) {
		if (name === 'main') {
			ports[name] = base
		} else if (given[name] > base && !others.has(given[name])) {
			ports[name] = given[name]
		}
	}
	const taken = new Set([...others, ...Object.values(ports)])
	let next = base + 1
	for (const name of worktrees) {
		if (ports[name] === undefined) {
			while (taken.has(next)) {
				next++
			}
			ports[name] = next
			taken.add(next)
		}
	}
	return ports
}

/**
 * Where the web ports of the checkout, or of an app, are stored
 * @param {string} home
 * @param {string} [app]
 */
function portsFile(home, app) {
	return path.join(home, app ? `web.${sanitize(app)}.json` : 'web.json')
}

/**
 * @param {string} home
 * @param {string} [app]
 * @returns {Record<string, number>}
 */
function readPorts(home, app) {
	try {
		return JSON.parse(fs.readFileSync(portsFile(home, app), 'utf-8'))
	} catch {
		return {}
	}
}

/**
 * Web ports taken by the other apps of the repo: their base and their worktrees'
 * @param {import('./paths.js').Context} ctx
 * @param {import('./config.js').App[]} apps
 */
export function reservedPorts(ctx, apps) {
	return apps
		.filter((a) => a.dir !== ctx.app && a.config.web)
		.flatMap((a) => [
			/** @type {number} */ (a.config.web),
			...Object.values(readPorts(ctx.home, a.dir)),
		])
}

/**
 * Web ports of the repo worktrees (of the app, in a monorepo), stored next to the server data
 * @param {import('./paths.js').Context} ctx
 * @param {number} base package.json "kitql-pg".web
 * @param {Iterable<number>} [reserved] ports of the other apps
 */
export function webPorts(ctx, base, reserved) {
	const file = portsFile(ctx.home, ctx.app)
	const given = readPorts(ctx.home, ctx.app)
	const worktrees = listWorktrees(ctx.commonDir)
	const names = worktrees.map((w) => w.name)
	if (!names.includes(ctx.worktree)) {
		names.push(ctx.worktree)
	}
	const ports = assignWebPorts(given, names, base, reserved)
	if (JSON.stringify(ports) !== JSON.stringify(given)) {
		fs.mkdirSync(ctx.home, { recursive: true })
		fs.writeFileSync(file, JSON.stringify(ports, null, 2) + '\n')
	}
	const app = ctx.app
	return {
		ports,
		worktrees: app ? worktrees.map((w) => ({ ...w, path: path.join(w.path, app) })) : worktrees,
	}
}

/**
 * Something listens on localhost:port (a dev server)
 * @param {number} port
 */
export async function isListening(port) {
	/** @param {string} host */
	const probe = (host) =>
		new Promise((resolve) => {
			const socket = net.connect({ port, host })
			/** @param {boolean} ok */
			const done = (ok) => {
				socket.destroy()
				resolve(ok)
			}
			socket.setTimeout(300)
			socket.once('connect', () => done(true))
			socket.once('error', () => done(false))
			socket.once('timeout', () => done(false))
		})
	const res = await Promise.all([probe('127.0.0.1'), probe('::1')])
	return res.includes(true)
}
