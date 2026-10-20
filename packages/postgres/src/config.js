import fs from 'node:fs'
import path from 'node:path'

/**
 * @typedef {object} Config
 * @property {number} [port] server port of the repo, committed for the whole team
 */

/**
 * Validate the `kitql-pg` field of package.json, e.g. `{ "port": 5435 }`
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
	const { port } = /** @type {Record<string, unknown>} */ (raw)
	if (port === undefined) {
		return {}
	}
	if (typeof port !== 'number' || !Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error(`package.json "kitql-pg".port must be a port number, got ${JSON.stringify(port)}`)
	}
	return { port }
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
