import { Log } from '@kitql/helper';

/** @type {import('./$types').PageLoad} */
export async function load() {
	const l = new Log('demo', { prefixEmoji: '👋' });
	l.success('Hello success');
	l.error('Hello error');
	l.info('Hello info 0', { level: 0 });
	l.info('Hello info 1', { level: 1 });
	l.info('Hello info 2', { level: 2 });
	l.info('Hello info 3', { level: 3, withSuccess: true });
	l.info('Hello info 2', { level: 2 });
	l.info('Hello info 1', { level: 1 });
	l.info('Hello info 0', { level: 0 });

	return {};
}
