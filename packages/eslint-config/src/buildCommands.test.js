import { describe, expect, it } from 'vitest'

import {
	baseCandidates,
	buildEslintCmd,
	buildOxfmtCmd,
	buildOxlintCmd,
	chunkFiles,
	quoteFiles,
} from './buildCommands.js'

const base = {
	tools: ['eslint', 'oxfmt'],
	format: false,
	glob: '.',
	pre: '',
	pathPrettierIgnore: '../../.prettierignore',
	pathOxfmtrc: '../../.oxfmtrc.json',
}

describe('buildOxlintCmd', () => {
	it('lint mode without tsgolint', () => {
		expect(buildOxlintCmd(base)).toBe('oxlint .')
	})

	it('lint mode with tsgolint adds --type-aware', () => {
		expect(buildOxlintCmd({ ...base, tools: ['oxlint', 'tsgolint'] })).toBe('oxlint --type-aware .')
	})

	it('format mode adds --fix', () => {
		expect(buildOxlintCmd({ ...base, format: true })).toBe('oxlint --fix .')
	})

	it('uses prefix', () => {
		expect(buildOxlintCmd({ ...base, pre: 'pnpm ' })).toBe('pnpm oxlint .')
	})

	it('allowUnmatched tolerates a list without lintable files', () => {
		expect(buildOxlintCmd({ ...base, allowUnmatched: true })).toBe(
			'oxlint --no-error-on-unmatched-pattern .',
		)
	})
})

describe('buildEslintCmd', () => {
	it('lint mode passes --no-warn-ignored', () => {
		expect(buildEslintCmd(base)).toBe('eslint --no-warn-ignored .')
	})

	it('format mode adds --fix', () => {
		expect(buildEslintCmd({ ...base, format: true })).toBe('eslint --no-warn-ignored --fix .')
	})

	it('uses prefix', () => {
		expect(buildEslintCmd({ ...base, pre: 'pnpm ' })).toBe('pnpm eslint --no-warn-ignored .')
	})
})

describe('buildOxfmtCmd', () => {
	it('lint mode uses --check', () => {
		const cmd = buildOxfmtCmd(base)
		expect(cmd).toContain('--check')
		expect(cmd).not.toContain('--write')
	})

	it('format mode uses --write', () => {
		const cmd = buildOxfmtCmd({ ...base, format: true })
		expect(cmd).toContain('--write')
		expect(cmd).not.toContain('--check')
	})

	it('passes ignore path and config', () => {
		const cmd = buildOxfmtCmd(base)
		expect(cmd).toContain('--ignore-path ../../.prettierignore')
		expect(cmd).toContain('--config ../../.oxfmtrc.json')
	})

	it('always passes --no-error-on-unmatched-pattern', () => {
		expect(buildOxfmtCmd(base)).toContain('--no-error-on-unmatched-pattern')
	})

	it('omits ignore-path/config when not provided', () => {
		const cmd = buildOxfmtCmd({ ...base, pathPrettierIgnore: undefined, pathOxfmtrc: undefined })
		expect(cmd).not.toContain('--ignore-path')
		expect(cmd).not.toContain('--config')
	})
})

describe('quoteFiles', () => {
	it('uses double quotes on win32 (cmd.exe keeps single quotes)', () => {
		expect(quoteFiles(['package.json', String.raw`src\a b.js`], 'win32')).toBe(
			String.raw`"package.json" "src\a b.js"`,
		)
	})

	it('escapes shell specials on posix', () => {
		expect(quoteFiles(['a b.js', 'x"$`\\.js'], 'linux')).toBe('"a b.js" "x\\"\\$\\`\\\\.js"')
	})
})

describe('chunkFiles', () => {
	const files = Array.from({ length: 3000 }, (_, i) => `src/routes/some/path/file-${i}.ts`)

	it('keeps every file, in order', () => {
		const chunks = chunkFiles(files, 'win32')
		expect(chunks.join(' ')).toBe(quoteFiles(files, 'win32'))
	})

	it('stays under the cmd.exe limit, shim included', () => {
		const chunks = chunkFiles(files, 'win32')
		expect(chunks.length).toBeGreaterThan(1)
		for (const chunk of chunks) expect(chunk.length).toBeLessThanOrEqual(6000)
	})

	it('allows far more on posix', () => {
		expect(chunkFiles(files, 'linux').length).toBeLessThan(chunkFiles(files, 'win32').length)
	})

	it('returns one chunk for a short list', () => {
		expect(chunkFiles(['a.ts', 'b.ts'], 'win32')).toEqual(['"a.ts" "b.ts"'])
	})

	it('gives an oversized path its own chunk', () => {
		const long = 'a'.repeat(7000)
		expect(chunkFiles(['a.ts', long, 'b.ts'], 'win32')).toEqual(['"a.ts"', `"${long}"`, '"b.ts"'])
	})
})

describe('baseCandidates', () => {
	it('default prefers the remote-tracking ref', () => {
		expect(baseCandidates()).toEqual(['refs/remotes/origin/main', 'main', 'HEAD~1'])
	})

	it('explicit base comes first, as given', () => {
		expect(baseCandidates('main')[0]).toBe('main')
		expect(baseCandidates('origin/dev')[0]).toBe('origin/dev')
	})
})
