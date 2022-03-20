import { describe, expect, it } from 'vitest';
import { KitQLClient } from '../src/lib/toExport/kitQLClient';

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
			operationName: 'KEY1',
			document: {},
			variables: {}
		});

		expect((kitQLClient as any).cacheMs).toMatchObject(180000);
	});
});
