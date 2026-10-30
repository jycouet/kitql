import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const CMD = fileURLToPath(new URL('../cmd.js', import.meta.url))

// Records its argv and fails on request: real tools would hide what reached them.
const FAKE_TOOL = `
const fs = require('node:fs')
const args = process.argv.slice(2)
fs.appendFileSync(process.env.FAKE_LOG, JSON.stringify(args) + '\\n')
if (process.env.FAKE_FAIL && args.includes(process.env.FAKE_FAIL)) process.exit(3)
`

/** @type {string} */
let dir
/** @type {string} */
let repo
/** @type {string} */
let log

const git = (/** @type {string[]} */ ...args) =>
	execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim()

const commitFile = (/** @type {string} */ file, content = '') => {
	fs.mkdirSync(path.dirname(path.join(repo, file)), { recursive: true })
	fs.writeFileSync(path.join(repo, file), content)
	git('add', '.')
	git('commit', '-qm', file)
}

const run = (
	/** @type {string[]} */ args,
	/** @type {Record<string, string>} */ env = {},
	cwd = repo,
) => {
	const pathKey = Object.keys(process.env).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH'
	return spawnSync(process.execPath, [CMD, '-d', ...args], {
		cwd,
		encoding: 'utf8',
		env: {
			...process.env,
			[pathKey]: path.join(dir, 'bin') + path.delimiter + process.env[pathKey],
			FAKE_LOG: log,
			...env,
		},
	})
}

/** Files each tool received, one entry per invocation. */
const calls = (/** @type {string} */ tool) => {
	const lines = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n') : []
	return lines
		.map((l) => JSON.parse(l))
		.filter((args) => args[0] === tool)
		.map((args) =>
			args.slice(1).filter((/** @type {string} */ a) => a.endsWith('.ts') || a.endsWith('.svelte')),
		)
}

const sorted = (/** @type {string[]} */ list) => list.toSorted((a, b) => a.localeCompare(b))

const received = (/** @type {string} */ tool) =>
	sorted(
		calls(tool)
			.flat()
			.map((f) => f.replaceAll('\\', '/')),
	)

beforeEach(() => {
	// native: an 8.3 tmpdir differs from the long path git reports
	dir = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'kitql-lint-')))
	repo = path.join(dir, 'repo')
	log = path.join(dir, 'calls.jsonl')
	fs.mkdirSync(repo)
	fs.mkdirSync(path.join(dir, 'bin'))
	fs.writeFileSync(path.join(dir, 'tool.cjs'), FAKE_TOOL)
	for (const tool of ['eslint', 'oxfmt', 'oxlint']) {
		const script = path.join(dir, 'tool.cjs')
		fs.writeFileSync(
			path.join(dir, 'bin', `${tool}.cmd`),
			`@"${process.execPath}" "${script}" ${tool} %*\r\n`,
		)
		fs.writeFileSync(
			path.join(dir, 'bin', tool),
			`#!/bin/sh\nexec "${process.execPath}" "${script}" ${tool} "$@"\n`,
			{ mode: 0o755 },
		)
	}
	git('init', '-q', '-b', 'main')
	git('config', 'user.email', 'test@kitql.dev')
	git('config', 'user.name', 'test')
	git('config', 'commit.gpgsign', 'false')
	commitFile('base.ts')
})

afterEach(() => {
	fs.rmSync(dir, { recursive: true, force: true })
})

// Each case spawns the CLI, up to 3 tools per chunk: slow on Windows
vi.setConfig({ testTimeout: 60_000 })

describe('kitql-lint -d base', () => {
	/** main stale locally, origin/main ahead with upstream.ts, feature forked from origin/main. */
	const staleLocalMain = () => {
		const stale = git('rev-parse', 'HEAD')
		commitFile('upstream.ts')
		git('update-ref', 'refs/remotes/origin/main', 'HEAD')
		git('checkout', '-qb', 'feature')
		git('update-ref', 'refs/heads/main', stale)
		commitFile('mine.ts')
	}

	it('prefers origin/main over a stale local main', () => {
		staleLocalMain()
		expect(run([]).status).toBe(0)
		expect(received('eslint')).toEqual(['mine.ts'])
	})

	it('does not move refs', () => {
		staleLocalMain()
		const before = git('show-ref')
		run([])
		expect(git('show-ref')).toBe(before)
	})

	it('explicit -b wins, even when it is the default name', () => {
		staleLocalMain()
		expect(run(['-b', 'main']).status).toBe(0)
		expect(received('eslint')).toEqual(['mine.ts', 'upstream.ts'])
	})

	it('falls back to local main without a remote-tracking ref', () => {
		git('checkout', '-qb', 'feature')
		commitFile('mine.ts')
		expect(run([]).status).toBe(0)
		expect(received('eslint')).toEqual(['mine.ts'])
	})

	it('compares to the fork point, not the tip of the base', () => {
		git('checkout', '-qb', 'feature')
		commitFile('mine.ts')
		git('checkout', '-q', 'main')
		commitFile('base.ts', 'edited upstream')
		git('update-ref', 'refs/remotes/origin/main', 'HEAD')
		git('checkout', '-q', 'feature')
		expect(run([]).status).toBe(0)
		expect(received('eslint')).toEqual(['mine.ts'])
	})

	it('keeps uncommitted changes in the diff', () => {
		git('checkout', '-qb', 'feature')
		commitFile('mine.ts')
		fs.writeFileSync(path.join(repo, 'base.ts'), 'edited')
		expect(run([]).status).toBe(0)
		expect(received('eslint')).toEqual(['base.ts', 'mine.ts'])
	})

	it('diffs directly when history is shallow (no merge-base)', () => {
		git('checkout', '-q', '--orphan', 'feature')
		git('rm', '-rfq', '.')
		commitFile('mine.ts')
		git('update-ref', 'refs/remotes/origin/main', 'main')
		expect(run([]).status).toBe(0)
		expect(received('eslint')).toEqual(['mine.ts'])
	})
})

describe('kitql-lint -d files', () => {
	it('hands route paths over verbatim', () => {
		git('checkout', '-qb', 'feature')
		const file = 'src/routes/(group)/[handle=handle]/[[opt]]/+page.svelte'
		commitFile(file)
		expect(run([]).status).toBe(0)
		expect(received('eslint')).toEqual([file])
		expect(received('oxfmt')).toEqual([file])
	})

	it('runs oxlint on the same paths', () => {
		git('checkout', '-qb', 'feature')
		const file = 'src/routes/(group)/[handle=handle]/+page.ts'
		commitFile(file)
		expect(run(['-t', 'oxlint,tsgolint']).status).toBe(0)
		expect(received('oxlint')).toEqual([file])
	})

	it('keeps non-ASCII paths', () => {
		git('checkout', '-qb', 'feature')
		commitFile('src/café.ts')
		expect(run([]).status).toBe(0)
		expect(received('eslint')).toEqual(['src/café.ts'])
	})

	it('keeps files when cwd is spelled differently than git reports it', () => {
		const short = path.join(os.tmpdir(), path.basename(dir), 'repo')
		if (short === repo) return // os.tmpdir() has no 8.3 segment here
		git('checkout', '-qb', 'feature')
		commitFile('mine.ts')
		expect(run([], {}, short).status).toBe(0)
		expect(received('eslint')).toEqual(['mine.ts'])
	})

	it('tolerates oxlint chunks without lintable files', () => {
		git('checkout', '-qb', 'feature')
		commitFile('logo.png')
		expect(run(['-t', 'oxlint']).status).toBe(0)
		expect(fs.readFileSync(log, 'utf8')).toContain('--no-error-on-unmatched-pattern')
	})

	describe('more paths than a command line holds', () => {
		const dirName = 'src/routes/(group)/[handle=handle]/a-rather-long-directory-name'
		const many = Array.from({ length: 1500 }, (_, i) => `${dirName}/file-${i}.ts`)

		beforeEach(() => {
			git('checkout', '-qb', 'feature')
			fs.mkdirSync(path.join(repo, dirName), { recursive: true })
			for (const file of many) fs.writeFileSync(path.join(repo, file), '')
			git('add', '.')
			git('commit', '-qm', 'many')
		})

		it('hands every file over', () => {
			expect(run([]).status).toBe(0)
			expect(calls('eslint').length).toBeGreaterThan(1)
			expect(received('eslint')).toEqual(sorted(many))
			expect(received('oxfmt')).toEqual(sorted(many))
		})

		it('fails when only an early chunk fails', () => {
			const { status } = run([], { FAKE_FAIL: path.normalize(`${dirName}/file-0.ts`) })
			expect(status).toBe(3)
		})

		it('fails when only the last chunk fails', () => {
			const { status } = run(['-t', 'oxfmt'], {
				FAKE_FAIL: path.normalize(`${dirName}/file-1499.ts`),
			})
			expect(status).toBe(3)
		})
	})
})
