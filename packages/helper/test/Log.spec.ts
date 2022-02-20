import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Log, logCyan, logGreen, logMagneta, logRed } from '../src/Log';

describe('kitql - helper - Log', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('Minimal config', async () => {
		let log = new Log('tool name');
		expect(log).to.have.property('toolName', 'tool name');

		const spy = vi.spyOn(log, 'info');
		log.info('Minimal config');
		expect(spy).toHaveBeenCalledOnce();
	});

	it('Config with sync', async () => {
		let log = new Log('tool name', { sync: true });
		expect(log).to.have.property('toolName', 'tool name');

		const spy = vi.spyOn(log, 'info');
		log.info('Config with sync');
		expect(spy).toHaveBeenCalledOnce();
	});

	it('Config without sync', async () => {
		let log = new Log('tool name', { sync: false });
		expect(log).to.have.property('toolName', 'tool name');

		const spy = vi.spyOn(log, 'info');
		log.info('Config without sync');
		expect(spy).toHaveBeenCalledOnce();
	});

	it('Config with time', async () => {
		let log = new Log('tool name', { withTime: true, sync: true });
		expect(log).to.have.property('toolName', 'tool name');

		const spy = vi.spyOn(log, 'info');
		log.info('Config with time');
		expect(spy).toHaveBeenCalledOnce();
	});

	it('Config with withlevelKey: false, should not print level', async () => {
		let log = new Log('tool name', { withlevelKey: false, sync: true });
		expect(log).to.have.property('toolName', 'tool name');

		const spy = vi.spyOn(log, 'info');
		log.info('Config with key level');
		expect(spy).toHaveBeenCalledOnce();
	});

	it('with an error', async () => {
		let log = new Log('tool name');
		expect(log).to.have.property('toolName', 'tool name');

		const spy = vi.spyOn(log, 'error');
		log.error('with an error');
		expect(spy).toHaveBeenCalledOnce();
	});

	it('with all colors', async () => {
		let log = new Log('tool name');
		expect(log).to.have.property('toolName', 'tool name');

		const spy = vi.spyOn(log, 'info');
		log.info(
			`with all colors: ${logGreen('green')}, ${logMagneta('magneta')}, ${logRed('red')}, ${logCyan(
				'cyan'
			)}, `
		);
		expect(spy).toHaveBeenCalledOnce();
	});
});
