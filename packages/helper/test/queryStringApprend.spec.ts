import { afterEach, describe, expect, it, vi } from 'vitest';
import { queryStringApprend } from '../src/queryStringApprend';

describe('kitql - helper - queryStringApprend', () => {
	it('with empty searchParams', async () => {
		let searchParams = new URLSearchParams();
		let qs = queryStringApprend(searchParams, { focus: 'Hello' });
		expect(qs).toMatchInlineSnapshot('"focus=Hello"');
	});

	it('with default searchParams', async () => {
		let searchParams = new URLSearchParams();
		searchParams.set('page', '7');
		let qs = queryStringApprend(searchParams, { focus: 'Hello' });
		expect(qs).toMatchInlineSnapshot('"focus=Hello&page=7"');
	});

	it('check sorting qs', async () => {
		let searchParams = new URLSearchParams();
		searchParams.set('page', '7');
		let qs = queryStringApprend(searchParams, { focus: 'Hello', sort: 'bestFirst' });
		expect(qs).toMatchInlineSnapshot('"focus=Hello&page=7&sort=bestFirst"');
	});
});
