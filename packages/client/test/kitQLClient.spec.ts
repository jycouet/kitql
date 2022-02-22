import { describe, expect, it } from 'vitest';
import { KitQLClient, RequestFrom, RequestStatus } from '../src/lib/toExport/kitQLClient';

// const defaultStoreValue = {
// 	status: RequestStatus.NEVER,
// 	date: new Date().getTime(),
// 	variables: null,
// 	data: null,
// 	errors: null,
// 	from: RequestFrom.NODATA
// };

describe('client - kitQLClient', () => {
	it('Should set and get data', async () => {
		let kitQLClient = new KitQLClient({ url: '/graphql' });
		kitQLClient.request({
			skFetch: {},
			browser: true,
			cache: 300,
			cacheKey: 'KEY1',
			document: {},
			variables: {}
		});

		expect((kitQLClient as any).cache).toMatchObject(180000);
	});
});
