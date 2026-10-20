import fs from 'node:fs'
import path from 'node:path'

const DATABASE_URL_LINE = /^(\s*DATABASE_URL\s*=\s*)(['"]?)(postgres(?:ql)?:\/\/[^'"\s]+)\2(.*)$/m
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
 * Same, on the `.env` file of a checkout
 * @param {string | undefined} root
 * @param {number} port
 * @param {string} db
 */
export function syncEnvFile(root, port, db) {
	const file = root && path.join(root, '.env')
	if (!file || !fs.existsSync(file)) {
		return undefined
	}
	const { content, from, to } = setEnvDatabase(fs.readFileSync(file, 'utf-8'), port, db)
	if (!to) {
		return undefined
	}
	fs.writeFileSync(file, content)
	return { file, from, to }
}
