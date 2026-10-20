#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
// Generates the `@kitql/postgres-<platform>` packages (esbuild style: one package per os/cpu,
// installed as optionalDependencies, nothing is downloaded at install / run time).
//
//   node scripts/platforms.js                       # current platform
//   node scripts/platforms.js --target all          # every platform
//   node scripts/platforms.js --target linux-x64,darwin-arm64
//   node scripts/platforms.js --meta-only           # only (re)write package.json + README
//   node scripts/platforms.js --target all --publish
//
// Downloads a theseus-rs/postgresql-binaries release, checks its sha256, strips what a local dev
// server does not need (headers, static libs, bundled python, ...) and writes `platforms/<platform>/`.
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

import { cyan, gray, Log } from '@kitql/helpers'
import { parseCli } from '@kitql/helpers/server'

import { PG_VERSION, platformPackageName, TARGETS } from '../src/platforms.js'
import { keep } from './strip.js'
import { readTar } from './tar.js'

const log = new Log('kitql-postgres platforms')
const WHITESPACE = /\s+/
const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const { values, help } = parseCli({
	name: 'platforms',
	options: {
		target: {
			type: 'string',
			short: 't',
			default: `${process.platform}-${process.arch}`,
			description: `"all" or a list of: ${Object.keys(TARGETS).join(', ')}`,
		},
		version: { type: 'string', default: PG_VERSION, description: 'theseus-rs release' },
		'package-version': {
			type: 'string',
			description: 'npm version of the packages (default: --version)',
		},
		'meta-only': { type: 'boolean', default: false, description: 'only write package.json & README' },
		publish: { type: 'boolean', default: false, description: 'npm publish the generated packages' },
	},
})
if (values.help) {
	console.info(help)
	process.exit(0)
}

const version = String(values.version)
const pkgVersion = String(values['package-version'] ?? version)
const targets = values.target === 'all' ? Object.keys(TARGETS) : String(values.target).split(',')
for (const t of targets) {
	if (!(t in TARGETS)) {
		log.error(`Unknown target "${t}". Use: all, ${Object.keys(TARGETS).join(', ')}`)
		process.exit(2)
	}
}

/** @param {string} url */
async function download(url) {
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`${res.status} ${res.statusText} for ${url}`)
	}
	return Buffer.from(await res.arrayBuffer())
}

/** @param {string} target */
async function getArchive(target) {
	const name = `postgresql-${version}-${TARGETS[/** @type {keyof typeof TARGETS} */ (target)]}.tar.gz`
	const base = `https://github.com/theseus-rs/postgresql-binaries/releases/download/${version}/${name}`
	const cacheDir = path.join(os.tmpdir(), 'kitql-postgres-downloads')
	const file = path.join(cacheDir, name)
	const expected = (await download(`${base}.sha256`))
		.toString()
		.trim()
		.split(WHITESPACE)[0]
		.toLowerCase()

	if (!fs.existsSync(file) || sha256(fs.readFileSync(file)) !== expected) {
		log.info(`Downloading ${gray(base)}`)
		fs.mkdirSync(cacheDir, { recursive: true })
		fs.writeFileSync(file, await download(base))
	}
	const buf = fs.readFileSync(file)
	if (sha256(buf) !== expected) {
		throw new Error(`sha256 mismatch for ${name}`)
	}
	return buf
}

/** @param {Buffer} buf */
function sha256(buf) {
	return createHash('sha256').update(buf).digest('hex')
}

/** @param {string} target */
function writeMeta(target) {
	const [platform, cpu] = target.split('-')
	const dir = path.join(pkgRoot, 'platforms', target)
	fs.mkdirSync(dir, { recursive: true })
	const name = platformPackageName(target)
	const pkg = {
		name,
		version: pkgVersion,
		description: `PostgreSQL ${version.split('.').slice(0, 2).join('.')} binaries (${target}) for @kitql/postgres`,
		license: 'PostgreSQL',
		repository: {
			type: 'git',
			url: 'git+https://github.com/jycouet/kitql.git',
			directory: `packages/postgres/platforms/${target}`,
		},
		homepage: 'https://www.kitql.dev/docs/tools/11_postgres',
		os: [platform],
		cpu: [cpu],
		...(platform === 'linux' ? { libc: ['glibc'] } : {}),
		files: ['bin', 'lib', 'share', 'LICENSE', 'COPYRIGHT', 'dependency-notices'],
		preferUnplugged: true,
		publishConfig: { access: 'public' },
	}
	fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, '\t') + '\n')
	fs.writeFileSync(
		path.join(dir, 'README.md'),
		[
			`# ${name}`,
			'',
			`PostgreSQL ${version} binaries for **${target}**, used by [\`@kitql/postgres\`](https://www.npmjs.com/package/@kitql/postgres).`,
			'Do not install it directly.',
			'',
			`Built by [theseus-rs/postgresql-binaries](https://github.com/theseus-rs/postgresql-binaries/releases/tag/${version}),`,
			'stripped (no headers, static libs, nor bundled python) by `packages/postgres/scripts/platforms.js`.',
			'',
		].join('\n'),
	)
	return dir
}

/**
 * @param {string} target
 * @param {string} dir
 */
async function extract(target, dir) {
	for (const entry of fs.readdirSync(dir)) {
		if (!['package.json', 'README.md'].includes(entry)) {
			fs.rmSync(path.join(dir, entry), { recursive: true, force: true })
		}
	}

	const entries = readTar(gunzipSync(await getArchive(target)))
	/** @type {Map<string, Buffer>} */
	const files = new Map()
	/** @type {{ rel: string, target: string }[]} */
	const links = []
	let kept = 0
	for (const e of entries) {
		// strip the `postgresql-<version>-<triple>/` top folder
		const rel = e.path.split('/').slice(1).join('/')
		if (!rel || !keep(rel)) {
			continue
		}
		const out = path.join(dir, rel)
		// folders are created with their files (no empty folders of dropped content)
		if (e.type === 'file') {
			fs.mkdirSync(path.dirname(out), { recursive: true })
			fs.writeFileSync(out, e.data, { mode: e.mode })
			files.set(e.path, e.data)
			kept += e.data.length
		} else if (e.type === 'symlink' || e.type === 'hardlink') {
			// npm tarballs drop links: materialize them as copies
			const linkTarget =
				e.type === 'symlink' ? path.posix.join(path.posix.dirname(e.path), e.linkPath) : e.linkPath
			links.push({ rel, target: linkTarget })
		}
	}
	for (const link of links) {
		let data = files.get(link.target)
		// link to a link
		for (let i = 0; !data && i < 5; i++) {
			const next = entries.find((e) => e.path === link.target)
			if (!next?.linkPath) {
				break
			}
			link.target = path.posix.join(path.posix.dirname(next.path), next.linkPath)
			data = files.get(link.target)
		}
		if (!data) {
			log.info(gray(`  skip link ${link.rel} -> ${link.target} (target dropped)`))
			continue
		}
		const out = path.join(dir, link.rel)
		fs.mkdirSync(path.dirname(out), { recursive: true })
		fs.writeFileSync(out, data, { mode: 0o755 })
		kept += data.length
	}
	return kept
}

for (const target of targets) {
	const dir = writeMeta(target)
	if (values['meta-only']) {
		log.success(`${platformPackageName(target)} meta written`)
		continue
	}
	const size = await extract(target, dir)
	log.success(
		`${cyan(platformPackageName(target))}@${pkgVersion} ${gray(`${(size / 1024 / 1024).toFixed(0)} MB in ${dir}`)}`,
	)

	if (values.publish) {
		const res = spawnSync('npm', ['publish', '--access', 'public'], {
			cwd: dir,
			stdio: 'inherit',
			shell: true,
		})
		if (res.status !== 0) {
			log.error(`npm publish failed for ${platformPackageName(target)}`)
			process.exit(1)
		}
	}
}
