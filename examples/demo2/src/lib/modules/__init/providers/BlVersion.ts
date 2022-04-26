import { gitStringDatetoDate } from '$lib/utils/format/formatDate';
import { existsSync, readFileSync } from 'fs';

export function getReleaseCreatedAtUtc() {
	const defaultDate = new Date('1986-11-07T06:05:04Z');
	if (existsSync('DEPLOY_DATETIME')) {
		const content = readFileSync('DEPLOY_DATETIME').toString();
		return gitStringDatetoDate(content) || defaultDate;
	}
	return defaultDate;
}
