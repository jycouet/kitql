import { describe, expect, it } from 'vitest'

import { buildEslintCmd, buildOxfmtCmd, buildOxlintCmd, quoteFiles } from './buildCommands.js'

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
