import { describe, expect, it } from 'vitest'

import { buildEslintCmd, buildOxfmtCmd, buildOxlintCmd, buildPrettierCmd } from './buildCommands.js'

const base = {
	tools: ['eslint', 'prettier'],
	format: false,
	glob: '.',
	pre: '',
	pathPrettierIgnore: '../../.prettierignore',
	pathPrettier_js: '../../.prettierrc.js',
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

describe('buildPrettierCmd', () => {
	it('without oxfmt: formats whatever glob is passed', () => {
		const cmd = buildPrettierCmd(base)
		expect(cmd).toContain('prettier --list-different')
		expect(cmd).not.toContain('--no-error-on-unmatched-pattern')
		expect(cmd).toMatch(/ \.$/)
	})

	it('with oxfmt: always targets only **/*.svelte (regardless of glob)', () => {
		const cmd = buildPrettierCmd({ ...base, tools: ['oxfmt', 'prettier'] })
		expect(cmd).toContain("'**/*.svelte'")
		expect(cmd).toContain('--no-error-on-unmatched-pattern')
	})

	it('with oxfmt: ignores any custom glob (svelte rule wins)', () => {
		const cmd = buildPrettierCmd({
			...base,
			tools: ['oxfmt', 'prettier'],
			glob: "'src/foo.ts' 'src/bar.svelte' 'src/baz.json'",
		})
		expect(cmd).toContain("'**/*.svelte'")
		expect(cmd).not.toContain('foo.ts')
		expect(cmd).not.toContain('baz.json')
	})

	it('format mode adds --write', () => {
		const cmd = buildPrettierCmd({ ...base, format: true })
		expect(cmd).toContain('--write')
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
