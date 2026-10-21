import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'

import { cyan, gray, Log } from '@kitql/helpers'

import { archiveUrl, TARGETS } from './platforms.js'
import { keep } from './strip.js'
import { readTar } from './tar.js'

const log = new Log('kitql-pg')

/**
 * Write the kept entries of a release archive into `dir`.
 * The `postgresql-<version>-<triple>/` top folder is removed, links become copies
 * (no symlink privilege needed on Windows).
 * @param {import('./tar.js').TarEntry[]} entries
 * @param {string} dir
 */
export function extract(entries, dir) {
	/** @type {Map<string, import('./tar.js').TarEntry>} */
	const byPath = new Map(entries.map((e) => [e.path, e]))
	let size = 0
	for (const e of entries) {
		const rel = e.path.split('/').slice(1).join('/')
		// folders are created with their files (no empty folders of dropped content)
		if (!rel || !keep(rel) || e.type === 'dir' || e.type === 'other') {
			continue
		}
		let source = e
		for (let i = 0; source && source.type !== 'file' && i < 10; i++) {
			const target =
				source.type === 'symlink'
					? path.posix.join(path.posix.dirname(source.path), source.linkPath)
					: source.linkPath
			source = /** @type {import('./tar.js').TarEntry} */ (byPath.get(target))
		}
		if (source?.type !== 'file') {
			continue
		}
		const out = path.join(dir, rel)
		fs.mkdirSync(path.dirname(out), { recursive: true })
		fs.writeFileSync(out, source.data, { mode: source.mode || 0o644 })
		size += source.data.length
	}
	return size
}

/**
 * Download, verify and extract a PostgreSQL build into `dir` (atomic: a `.complete` marker is
 * written last, concurrent first runs do not step on each other).
 * @param {{ version: string, target: import('./platforms.js').Target, dir: string }} opts
 */
export async function install({ version, target, dir }) {
	const { triple, sha256 } = TARGETS[target]
	const url = archiveUrl(version, triple)
	log.info(`First use: downloading PostgreSQL ${version} (${target}) once ${gray(url)}`)

	let archive
	try {
		const res = await fetch(url)
		if (!res.ok) {
			throw new Error(`${res.status} ${res.statusText}`)
		}
		archive = Buffer.from(await res.arrayBuffer())
	} catch (e) {
		throw new Error(
			`Could not download PostgreSQL (${/** @type {Error} */ (e).message}).\n` +
				`The first run needs internet, then it works offline. ` +
				`Or use another install with KITQL_PG_BIN=/path/to/postgres/bin`,
			{ cause: e },
		)
	}
	const actual = createHash('sha256').update(archive).digest('hex')
	if (actual !== sha256) {
		throw new Error(`Checksum mismatch for ${url}\n  expected ${sha256}\n  got      ${actual}`)
	}

	const tmp = `${dir}.tmp-${process.pid}`
	fs.rmSync(tmp, { recursive: true, force: true })
	const size = extract(readTar(gunzipSync(archive)), tmp)
	fs.writeFileSync(path.join(tmp, '.complete'), `${version} ${triple} ${sha256}\n`)
	const complete = path.join(dir, '.complete')
	try {
		if (fs.existsSync(complete)) {
			// another process finished first
			fs.rmSync(tmp, { recursive: true, force: true })
		} else {
			fs.rmSync(dir, { recursive: true, force: true })
			fs.renameSync(tmp, dir)
		}
	} catch (e) {
		fs.rmSync(tmp, { recursive: true, force: true })
		if (!fs.existsSync(complete)) {
			throw e
		}
	}
	log.success(
		`PostgreSQL ${version} ready ${cyan(`(${(size / 1024 / 1024).toFixed(0)} MB)`)} ${gray(dir)}`,
	)
}
