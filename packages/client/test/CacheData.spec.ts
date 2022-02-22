import { assert, describe, expect, it } from 'vitest';
import { CacheData } from '../src/lib/toExport/CacheData';
import { RequestFrom, RequestStatus } from '../src/lib/toExport/kitQLClient';

const defaultStoreValue = {
	status: RequestStatus.NEVER,
	date: new Date().getTime(),
	variables: null,
	data: null,
	errors: null,
	from: RequestFrom.NODATA
};

describe('client - Cache Data', () => {
	it('Should set and get data', async () => {
		let cacheData = new CacheData();
		const data = { ...defaultStoreValue, variables: { a: 1 }, data: 'Hello' };
		cacheData.set('KEY1', data);
		let cachedData = cacheData.get('KEY1', { a: 1 });
		expect(cachedData.data).toEqual('Hello');
	});

	it('Should set and get data 2 times', async () => {
		let cacheData = new CacheData();
		let data = { ...defaultStoreValue, variables: { a: 1 }, data: 'Hello' };
		cacheData.set('KEY1', data);
		data = { ...defaultStoreValue, variables: { a: 2 }, data: 'Hello2' };
		cacheData.set('KEY1', data);

		let cachedData = cacheData.get('KEY1', { a: 1 });
		expect(cachedData.data).toMatchInlineSnapshot('"Hello"');
		cachedData = cacheData.get('KEY1', { a: 2 });
		expect(cachedData.data).toMatchInlineSnapshot('"Hello2"');
	});

	it('Should remove ALL from cache', async () => {
		let cacheData = new CacheData();
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
	});

	it('Should remove 1 operation from cache', async () => {
		let cacheData = new CacheData();
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
	});
});
