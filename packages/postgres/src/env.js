import fs from 'node:fs'
import path from 'node:path'

const DATABASE_URL_LINE = /^(\s*DATABASE_URL\s*=\s*)(['"]?)(postgres(?:ql)?:\/\/[^'"\s]+)\2(.*)$/m
const ORIGIN_LINE = /^(\s*ORIGIN\s*=\s*)(['"]?)(https?:\/\/[^'"\s]+)\2(.*)$/m
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']

/**
 * Point the `DATABASE_URL` of a .env content to another database of this server.
 * Only touches a url on localhost:<port> (never a remote / another project's db), keeps user,
 * password, host and query as they are.
 * @param {string} content .env content
 * @param {number} port
 * @param {string} db
 * @returns {{ content: string, from?: string, to?: string }}
 */
export function setEnvDatabase(content, port, db) {
	const match = DATABASE_URL_LINE.exec(content)
	if (!match) {
		return { content }
	}
	const [line, prefix, quote, value, rest] = match
	let url
	try {
		url = new URL(value)
	} catch {
		return { content }
	}
	if (!LOCAL_HOSTS.includes(url.hostname) || Number(url.port || 5432) !== port) {
		return { content }
	}
	const from = url.pathname.slice(1)
	if (from === db) {
		return { content }
	}
	url.pathname = `/${db}`
	const next = `${prefix}${quote}${url.toString()}${quote}${rest}`
	return { content: content.replace(line, next), from, to: db }
}

/**
 * Local `ORIGIN` of a .env content (the dev server url)
 * @param {string} content
 */
export function envOrigin(content) {
	const match = ORIGIN_LINE.exec(content)
	if (!match) {
		return undefined
	}
	try {
		const url = new URL(match[3])
		return LOCAL_HOSTS.includes(url.hostname) ? { line: match, url } : undefined
	} catch {
		return undefined
	}
}

/**
 * Move the local `ORIGIN` of a .env content to another port (the dev server reads its port there)
 * @param {string} content .env content
 * @param {number} port
 * @returns {{ content: string, from?: string, to?: string }}
 */
export function setEnvOrigin(content, port) {
	const origin = envOrigin(content)
	if (!origin || Number(origin.url.port) === port) {
		return { content }
	}
	const [line, prefix, quote, value, rest] = origin.line
	const to = value.replace(origin.url.host, `${origin.url.hostname}:${port}`)
	return { content: content.replace(line, `${prefix}${quote}${to}${quote}${rest}`), from: value, to }
}

/**
 * Edit the `.env` file of a checkout, if any
 * @param {string | undefined} root
 * @param {(content: string) => { content: string, from?: string, to?: string }} edit
 */
function editEnvFile(root, edit) {
	const file = root && path.join(root, '.env')
	if (!file || !fs.existsSync(file)) {
		return undefined
	}
	const { content, from, to } = edit(fs.readFileSync(file, 'utf-8'))
	if (!to) {
		return undefined
	}
	fs.writeFileSync(file, content)
	return { file, from, to }
}

/**
 * `setEnvDatabase` on the `.env` file of a checkout
 * @param {string | undefined} root
 * @param {number} port
 * @param {string} db
 */
export function syncEnvFile(root, port, db) {
	return editEnvFile(root, (content) => setEnvDatabase(content, port, db))
}

/**
 * `setEnvOrigin` on the `.env` file of a checkout
 * @param {string | undefined} root
 * @param {number} port
 */
export function syncEnvOrigin(root, port) {
	return editEnvFile(root, (content) => setEnvOrigin(content, port))
}

/**
 * Dev server url of a checkout: its .env ORIGIN on `port`, else localhost
 * @param {string | undefined} root
 * @param {number} port
 */
export function webUrl(root, port) {
	const file = root && path.join(root, '.env')
	const origin = file && fs.existsSync(file) ? envOrigin(fs.readFileSync(file, 'utf-8')) : undefined
	if (!origin) {
		return `http://localhost:${port}`
	}
	return `${origin.url.protocol}//${origin.url.hostname}:${port}`
}
