import { describe, expect, it } from 'vitest'

import { parseCli } from './index.js'

describe('parseCli', () => {
	it('parses boolean and string options with short flags', () => {
		const { values } = parseCli({
			options: {
				format: { type: 'boolean', short: 'f' },
				glob: { type: 'string', short: 'g' },
			},
			args: ['-f', '--glob', 'src'],
		})
		expect(values.format).toBe(true)
		expect(values.glob).toBe('src')
	})

	it('applies defaults when an option is absent', () => {
		const { values } = parseCli({
			options: {
				glob: { type: 'string', short: 'g', default: '.' },
				verbose: { type: 'boolean', short: 'v', default: false },
			},
			args: [],
		})
		expect(values.glob).toBe('.')
		expect(values.verbose).toBe(false)
	})

	it('keeps kebab-case option names as declared', () => {
		const { values } = parseCli({
			options: {
				'diff-only': { type: 'boolean', short: 'd', default: false },
				'base-branch': { type: 'string', short: 'b', default: 'main' },
			},
			args: ['-d', '--base-branch', 'dev'],
		})
		expect(values['diff-only']).toBe(true)
		expect(values['base-branch']).toBe('dev')
	})

	it('collects positionals when allowed', () => {
		const { positionals } = parseCli({
			options: { config: { type: 'string', short: 'c' } },
			allowPositionals: true,
			args: ['sync', '--config', 'vite.config.ts'],
		})
		expect(positionals).toEqual(['sync'])
	})

	it('does not throw on --help and reports it in values', () => {
		const { values, help } = parseCli({
			name: 'demo',
			description: 'demo cli',
			options: { format: { type: 'boolean', short: 'f', description: 'format files' } },
			args: ['--help'],
		})
		expect(values.help).toBe(true)
		expect(help).toContain('demo')
		expect(help).toContain('--format')
		expect(help).toContain('format files')
	})

	it('recognizes --version only when a version is configured', () => {
		const { values } = parseCli({
			name: 'demo',
			version: '1.2.3',
			options: {},
			args: ['--version'],
		})
		expect(values.version).toBe(true)
	})
})
