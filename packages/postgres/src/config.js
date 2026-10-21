import fs from 'node:fs'
import path from 'node:path'

/**
 * @typedef {object} Config
 * @property {number} [port] server port of the repo, committed for the whole team
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
	const { port, web, links } = /** @type {Record<string, unknown>} */ (raw)
	/** @type {Config} */
	const config = {}
	if (port !== undefined) {
		config.port = portOf(port, 'port')
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
 * Config committed in the `package.json` at the root of the checkout
 * @param {string} root
 * @returns {Config}
 */
export function readConfig(root) {
	let pkg
	try {
		pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'))
	} catch {
		return {}
	}
	return parseConfig(pkg?.['kitql-pg'])
}
