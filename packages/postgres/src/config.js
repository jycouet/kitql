import fs from 'node:fs'
import path from 'node:path'

import { MAX_IDENTIFIER_LENGTH } from './naming.js'

const DB_NAME = /^[a-z_][a-z0-9_-]*$/
const SKIP_DIR = /^(\.|node_modules$)/

/**
 * @typedef {object} Config
 * @property {number} [port] server port of the repo, committed for the whole team
 * @property {string} [db] main's db (default: named after the repo), worktrees get `<db>_<worktree>`
 * @property {number} [web] dev server port of main, the other worktrees get the next ones
 * @property {string[]} [links] dev server paths worth opening (`/?login-as=admin`), shown by status
 */

/**
 * @param {unknown} value
 * @param {string} key
 */
function portOf(value, key) {
	if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 65535) {
		throw new Error(
			`package.json "kitql-pg".${key} must be a port number, got ${JSON.stringify(value)}`,
		)
	}
	return value
}

/**
 * Validate the `kitql-pg` field of package.json, e.g. `{ "port": 5435, "web": 5173 }`
 * @param {unknown} raw
 * @returns {Config}
 */
export function parseConfig(raw) {
	if (raw === undefined || raw === null) {
		return {}
	}
	if (typeof raw !== 'object' || Array.isArray(raw)) {
		throw new Error(`package.json "kitql-pg" must be an object, like { "port": 5435 }`)
	}
	const { port, db, web, links } = /** @type {Record<string, unknown>} */ (raw)
	/** @type {Config} */
	const config = {}
	if (port !== undefined) {
		config.port = portOf(port, 'port')
	}
	if (db !== undefined) {
		if (typeof db !== 'string' || !DB_NAME.test(db) || db.length > MAX_IDENTIFIER_LENGTH) {
			throw new Error(
				`package.json "kitql-pg".db must be a lowercase name, like "my_app" or "my-app", got ${JSON.stringify(db)}`,
			)
		}
		config.db = db
	}
	if (web !== undefined) {
		config.web = portOf(web, 'web')
	}
	if (links !== undefined) {
		if (!Array.isArray(links) || !links.every((l) => typeof l === 'string' && l.startsWith('/'))) {
			throw new Error(`package.json "kitql-pg".links must be paths, like ["/?login-as=admin"]`)
		}
		config.links = links
	}
	return config
}

/**
 * The `kitql-pg` field of the package.json in `dir`, undefined when there is none
 * @param {string} dir
 * @returns {Config | undefined}
 */
function readField(dir) {
	let pkg
	try {
		pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'))
	} catch {
		return undefined
	}
	const raw = pkg?.['kitql-pg']
	return raw === undefined ? undefined : parseConfig(raw)
}

/**
 * Config committed in the `package.json` at the root of the checkout
 * @param {string} root
 * @returns {Config}
 */
export function readConfig(root) {
	return readField(root) ?? {}
}

/**
 * @typedef {object} App
 * @property {string} name folder name (`capa`)
 * @property {string} dir path from the checkout root, with `/` (`apps/capa`)
 * @property {Config} config its own `kitql-pg` field: db, web, links (the port is the repo's)
 */

/**
 * @param {string} root
 * @param {string} dir from root
 * @returns {App | undefined}
 */
function readApp(root, dir) {
	const config = readField(path.join(root, dir))
	if (!config) {
		return undefined
	}
	if (config.port !== undefined) {
		throw new Error(
			`${dir}/package.json "kitql-pg".port: the server is shared, set the port in the root package.json`,
		)
	}
	return { name: path.basename(dir), dir: dir.split(path.sep).join('/'), config }
}

/**
 * Sub-projects (monorepo apps, one or two folders deep) with their own `kitql-pg` field: one db
 * and dev server each, on the repo server
 * @param {string} root
 * @returns {App[]}
 */
export function findApps(root) {
	/** @param {string} dir */
	const children = (dir) => {
		try {
			return fs
				.readdirSync(path.join(root, dir), { withFileTypes: true })
				.filter((d) => d.isDirectory() && !SKIP_DIR.test(d.name))
				.map((d) => path.join(dir, d.name))
				.sort()
		} catch {
			return []
		}
	}
	/** @type {App[]} */
	const apps = []
	for (const dir of children('')) {
		for (const d of [dir, ...children(dir)]) {
			const app = readApp(root, d)
			if (app) {
				apps.push(app)
			}
		}
	}
	return apps
}

/**
 * The app holding `cwd`, if any
 * @param {App[]} apps
 * @param {string} root
 * @param {string} cwd
 */
export function appOf(apps, root, cwd) {
	const fold = (/** @type {string} */ p) => (process.platform === 'win32' ? p.toLowerCase() : p)
	const rel = fold(path.relative(root, cwd).split(path.sep).join('/'))
	return apps.find((a) => rel === fold(a.dir) || rel.startsWith(fold(a.dir) + '/'))
}
