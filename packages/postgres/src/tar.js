/**
 * Minimal tar reader (ustar + pax + GNU long names), enough for release archives.
 * Node has no tar, and system `tar` differs between OSes (symlinks on Windows...).
 */

/**
 * @typedef {object} TarEntry
 * @property {string} path
 * @property {'file' | 'dir' | 'symlink' | 'hardlink' | 'other'} type
 * @property {number} mode
 * @property {Buffer} data
 * @property {string} linkPath
 */

const LEADING_DOT_SLASH = /^\.\//
const TRAILING_SLASH = /\/$/

/** @param {Buffer} buf */
function str(buf) {
	const end = buf.indexOf(0)
	return buf.subarray(0, end === -1 ? buf.length : end).toString('utf-8')
}

/** @param {Buffer} buf */
function num(buf) {
	// base-256 for big values
	if (buf[0] & 0x80) {
		let n = 0
		for (let i = 1; i < buf.length; i++) {
			n = n * 256 + buf[i]
		}
		return n
	}
	return parseInt(str(buf).trim() || '0', 8)
}

/** @param {Buffer} data */
function parsePax(data) {
	/** @type {Record<string, string>} */
	const out = {}
	let pos = 0
	while (pos < data.length) {
		const space = data.indexOf(0x20, pos)
		if (space === -1) {
			break
		}
		const len = Number(data.subarray(pos, space).toString())
		if (!len) {
			break
		}
		const record = data.subarray(space + 1, pos + len - 1).toString('utf-8')
		const eq = record.indexOf('=')
		out[record.slice(0, eq)] = record.slice(eq + 1)
		pos += len
	}
	return out
}

/**
 * @param {Buffer} tar uncompressed tar
 * @returns {TarEntry[]}
 */
export function readTar(tar) {
	/** @type {TarEntry[]} */
	const entries = []
	/** @type {Record<string, string>} */
	let pax = {}
	/** @type {Record<string, string>} */
	let globalPax = {}
	let longName = ''
	let longLink = ''
	let pos = 0

	while (pos + 512 <= tar.length) {
		const header = tar.subarray(pos, pos + 512)
		if (header.every((b) => b === 0)) {
			break
		}
		const size = num(header.subarray(124, 136))
		const flag = String.fromCharCode(header[156] || 48)
		const data = tar.subarray(pos + 512, pos + 512 + size)
		pos += 512 + Math.ceil(size / 512) * 512

		if (flag === 'x') {
			pax = parsePax(data)
			continue
		}
		if (flag === 'g') {
			globalPax = { ...globalPax, ...parsePax(data) }
			continue
		}
		if (flag === 'L') {
			longName = str(data)
			continue
		}
		if (flag === 'K') {
			longLink = str(data)
			continue
		}

		const prefix = str(header.subarray(345, 500))
		const name = str(header.subarray(0, 100))
		const meta = { ...globalPax, ...pax }
		const fullPath = meta.path ?? (longName || (prefix ? `${prefix}/${name}` : name))
		const linkPath = meta.linkpath ?? (longLink || str(header.subarray(157, 257)))
		pax = {}
		longName = ''
		longLink = ''

		/** @type {TarEntry['type']} */
		let type = 'other'
		if (flag === '0' || flag === '7') {
			type = 'file'
		} else if (flag === '5') {
			type = 'dir'
		} else if (flag === '2') {
			type = 'symlink'
		} else if (flag === '1') {
			type = 'hardlink'
		}
		entries.push({
			path: fullPath.replace(LEADING_DOT_SLASH, '').replace(TRAILING_SLASH, ''),
			type,
			mode: num(header.subarray(100, 108)) & 0o777,
			data,
			linkPath,
		})
	}
	return entries
}
