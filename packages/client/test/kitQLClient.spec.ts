import { describe, expect, it } from 'vitest';
import { KitQLClient } from '../src/lib/toExport/kitQLClient';

describe('client - kitQLClient', () => {
	it('Should set init with right cacheMS', async () => {
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

	it('Should have default headers', async () => {
		let kitQLClient = new KitQLClient({ url: '/graphql' });
		expect((kitQLClient as any).headers).toMatchInlineSnapshot('{}');
		expect(kitQLClient.getHeaders()).toMatchInlineSnapshot('{}');
	});

	it('Should set and get headers', async () => {
		let kitQLClient = new KitQLClient({ url: '/graphql' });
		kitQLClient.setHeaders({ hello: 'JYC' });
		expect(kitQLClient.getHeaders()).toMatchInlineSnapshot(`
			{
			  "hello": "JYC",
			}
		`);
	});

	it('Should set and get headers typed', async () => {
		let kitQLClient = new KitQLClient<AppHeaders>({ url: '/graphql' });

		type AppHeaders = {
			Authorization: `Bearer ${string}`;
		};

		kitQLClient.setHeaders({ Authorization: `Bearer MY_TOKEN` });
		expect(kitQLClient.getHeaders()).toMatchInlineSnapshot(`
			{
			  "Authorization": "Bearer MY_TOKEN",
			}
		`);
	});
});
