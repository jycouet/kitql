import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { extract } from './install.js'
import { keep } from './strip.js'
import { readTar } from './tar.js'

describe('strip', () => {
	it('keeps the runtime', () => {
		for (const f of [
			'bin/postgres.exe',
			'bin/psql',
			'bin/icudt78.dll',
			'lib/libpq.so.5',
			'lib/plpgsql.so',
			'share/postgres.bki',
			'LICENSE',
			'dependency-notices/x.txt',
		]) {
			expect(keep(f), f).toBe(true)
		}
	})

	it('drops build files & python', () => {
		for (const f of [
			'include/libpq-fe.h',
			'bin/python.exe',
			'bin/python314.dll',
			'bin/Lib/os.py',
			'bin/DLLs/_ssl.pyd',
			'lib/libpq.a',
			'lib/postgres.lib',
			'lib/pgxs/Makefile',
			'lib/python3.11/os.py',
			'lib/libpython3.11.so.1.0',
			'lib/plpython3.dll',
			'lib/hstore_plpython3.so',
			'README.md',
			'build-manifest.json',
		]) {
			expect(keep(f), f).toBe(false)
		}
	})
})

/**
 * @param {string} name
 * @param {string} flag
 * @param {string} [content]
 * @param {string} [link]
 */
function entry(name, flag, content = '', link = '') {
	const header = Buffer.alloc(512)
	header.write(name, 0)
	header.write('0000755\0', 100)
	header.write(Buffer.byteLength(content).toString(8).padStart(11, '0') + '\0', 124)
	header.write(flag, 156)
	header.write(link, 157)
	header.write('ustar\0', 257)
	const data = Buffer.alloc(Math.ceil(Buffer.byteLength(content) / 512) * 512)
	data.write(content)
	return Buffer.concat([header, data])
}

describe('readTar', () => {
	it('reads files, dirs, links and pax long names', () => {
		const long = `top/${'a'.repeat(120)}.txt`
		const pax = `${String(`path=${long}\n`.length + 4)} path=${long}\n`
		const tar = Buffer.concat([
			entry('top/', '5'),
			entry('top/bin/psql', '0', 'hello'),
			entry('top/lib/libpq.so', '2', '', 'libpq.so.5'),
			entry('PaxHeader', 'x', pax),
			entry('ignored', '0', 'long'),
			Buffer.alloc(1024),
		])
		const entries = readTar(tar)
		expect(entries.map((e) => [e.path, e.type])).toEqual([
			['top', 'dir'],
			['top/bin/psql', 'file'],
			['top/lib/libpq.so', 'symlink'],
			[long, 'file'],
		])
		expect(entries[1].data.toString()).toBe('hello')
		expect(entries[1].mode).toBe(0o755)
		expect(entries[2].linkPath).toBe('libpq.so.5')
	})
})

describe('extract', () => {
	it('strips the top folder, drops unwanted files and copies links', () => {
		const tar = Buffer.concat([
			entry('pg/', '5'),
			entry('pg/bin/psql', '0', 'psql!'),
			entry('pg/include/x.h', '0', 'header'),
			entry('pg/lib/libpq.so.5.18', '0', 'lib!'),
			entry('pg/lib/libpq.so.5', '2', '', 'libpq.so.5.18'),
			entry('pg/lib/libpq.so', '2', '', 'libpq.so.5'),
			Buffer.alloc(1024),
		])
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kitql-pg-'))
		extract(readTar(tar), dir)
		expect(fs.readFileSync(path.join(dir, 'bin', 'psql'), 'utf-8')).toBe('psql!')
		expect(fs.readFileSync(path.join(dir, 'lib', 'libpq.so'), 'utf-8')).toBe('lib!')
		expect(fs.readFileSync(path.join(dir, 'lib', 'libpq.so.5'), 'utf-8')).toBe('lib!')
		expect(fs.existsSync(path.join(dir, 'include'))).toBe(false)
	})
})
