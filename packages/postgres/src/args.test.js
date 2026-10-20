import { describe, expect, it } from 'vitest'

import { parseArgs } from './args.js'

describe('parseArgs', () => {
	it('help without command', () => {
		expect(parseArgs([]).command).toBe(null)
		expect(parseArgs(['--help']).command).toBe(null)
		expect(parseArgs(['up', '-h']).help).toContain('clone <from>')
	})

	it('commands with defaults', () => {
		expect(parseArgs(['init'])).toMatchObject({
			command: 'init',
			args: [],
			db: undefined,
			force: false,
		})
	})

	it('clone needs a source', () => {
		expect(() => parseArgs(['clone'])).toThrow('Missing argument: kitql-pg clone <from>')
		expect(parseArgs(['clone', 'main', '-f'])).toMatchObject({
			command: 'clone',
			args: ['main'],
			force: true,
		})
	})

	it('optional positional', () => {
		expect(parseArgs(['dump']).args).toEqual([])
		expect(parseArgs(['dump', 'x.dump']).args).toEqual(['x.dump'])
		expect(() => parseArgs(['dump', 'a', 'b'])).toThrow('Too many arguments')
		expect(() => parseArgs(['ls', 'a'])).toThrow('Too many arguments')
	})

	it('psql passes everything after --', () => {
		expect(parseArgs(['psql', '--db', 'x', '--', '-c', 'select 1'])).toMatchObject({
			command: 'psql',
			db: 'x',
			args: ['-c', 'select 1'],
		})
	})

	it('port', () => {
		expect(parseArgs(['up', '-p', '5433']).port).toBe(5433)
		expect(() => parseArgs(['up', '--port', 'abc'])).toThrow('Invalid port')
	})

	it('unknown command / option', () => {
		expect(() => parseArgs(['start'])).toThrow('Unknown command "start"')
		expect(() => parseArgs(['init', '--nope'])).toThrow('kitql-pg --help')
	})
})
