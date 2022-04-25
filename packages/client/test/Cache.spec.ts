/**
 * @vitest-environment jsdom
 */

/**
 * This test runs in jsdom enviroment to have automatic window mocks.
 * It just works out of box
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { ICacheData } from '../src/lib/toExport/cache/ICacheData';
import { InMemoryCache } from '../src/lib/toExport/cache/InMemoryCache';
import { LocalStorageCache } from '../src/lib/toExport/cache/LocalStorageCache';
import {
	RequestFrom,
	RequestResult,
	RequestStatus,
	ResponseResultType
} from '../src/lib/toExport/kitQLClient';

const defaultStoreValue: RequestResult<any, any> = {
	status: RequestStatus.NEVER,
	isFetching: false,
	date: new Date().getTime(),
	operationName: 'OP1',
	operationType: ResponseResultType.Query,
	variables: null,
	data: null,
	errors: null,
	from: RequestFrom.NODATA,
	isOutdated: false
};

describe('client - Cache Data', () => {
	let cacheTypes: ICacheData[];

	beforeEach(() => {
		// Add all implementations of ICacheData to have all tests running on all implementations.
		cacheTypes = [];
		cacheTypes.push(new InMemoryCache());
		cacheTypes.push(new LocalStorageCache());
	});

	it('Should set and get data', async () => {
		for (let i = 0; i < cacheTypes.length; i++) {
			const cacheData = cacheTypes[i];

			const data = { ...defaultStoreValue, variables: { a: 1 }, data: 'Hello' };
			cacheData.set('KEY1', data);
			let cachedData = cacheData.get('KEY1', { a: 1 });
			expect(cachedData.data).toEqual('Hello');
		}
	});

	it('Should set and get data 2 times', async () => {
		for (let i = 0; i < cacheTypes.length; i++) {
			const cacheData = cacheTypes[i];

			let data = { ...defaultStoreValue, variables: { a: 1 }, data: 'Hello' };
			cacheData.set('KEY1', data);
			data = { ...defaultStoreValue, variables: { a: 2 }, data: 'Hello2' };
			cacheData.set('KEY1', data);

			let cachedData = cacheData.get('KEY1', { a: 1 });
			expect(cachedData.data).toMatchInlineSnapshot('"Hello"');
			cachedData = cacheData.get('KEY1', { a: 2 });
			expect(cachedData.data).toMatchInlineSnapshot('"Hello2"');
		}
	});

	it('Should remove ALL from cache', async () => {
		for (let i = 0; i < cacheTypes.length; i++) {
			const cacheData = cacheTypes[i];

			let data = { ...defaultStoreValue, variables: { a: 1 }, data: 'Hello' };
			cacheData.set('KEY1', data);
			data = { ...defaultStoreValue, variables: { a: 2 }, data: 'Hello2' };
			cacheData.set('KEY1', data);

			let cachedData = cacheData.get('KEY1', { a: 1 });
			expect(cachedData.data).toMatchInlineSnapshot('"Hello"');
			cachedData = cacheData.get('KEY1', { a: 2 });
			expect(cachedData.data).toMatchInlineSnapshot('"Hello2"');

			let nb = cacheData.remove('KEY1');
			expect(nb).toBe(2);
		}
	});

	it('Should remove 1 operation from cache', async () => {
		for (let i = 0; i < cacheTypes.length; i++) {
			const cacheData = cacheTypes[i];

			let data = { ...defaultStoreValue, variables: { a: 1 }, data: 'Hello' };
			cacheData.set('KEY1', data);
			data = { ...defaultStoreValue, variables: { a: 2 }, data: 'Hello2' };
			cacheData.set('KEY1', data);

			let cachedData = cacheData.get('KEY1', { a: 1 });
			expect(cachedData.data).toMatchInlineSnapshot('"Hello"');
			cachedData = cacheData.get('KEY1', { a: 2 });
			expect(cachedData.data).toMatchInlineSnapshot('"Hello2"');

			let nb = cacheData.remove('KEY1', { a: 1 }, false);
			expect(nb).toBe(1);
			cachedData = cacheData.get('KEY1', { a: 1 });
			expect(cachedData).toBeUndefined();

			cachedData = cacheData.get('KEY1', { a: 2 });
			expect(cachedData.data).toMatchInlineSnapshot('"Hello2"');
		}
	});

	it('Should return undefined if doesn t exist!', async () => {
		for (let i = 0; i < cacheTypes.length; i++) {
			const cacheData = cacheTypes[i];

			let cachedData = cacheData.get('KEY1', { a: 1 });
			expect(cachedData).toBeUndefined();
		}
	});
});
