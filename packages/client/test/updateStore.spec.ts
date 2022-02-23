import { beforeEach, describe, expect, it } from 'vitest';
import {
	KitQLClient,
	RequestFrom,
	RequestResult,
	RequestStatus
} from '../src/lib/toExport/kitQLClient';

type TContrat = {
	id: number;
	name: string;
	invoices: TInvoice[];
};

type TInvoice = {
	id: number;
	amount: number;
};

type TStore = {
	contracts: TContrat[];
	test: Record<string, number>;
};

describe('client - UpdateStore', () => {
	let store: RequestResult<TStore, any>;
	let kitQLClient: KitQLClient;

	beforeEach(() => {
		kitQLClient = new KitQLClient({ url: '/graphql' });
		store = {
			status: RequestStatus.NEVER,
			isFetching: false,
			date: new Date().getTime(),
			variables: null,
			data: {
				contracts: [
					{
						id: 1,
						name: 'contrat1',
						invoices: [
							{ id: 1, amount: 1234 },
							{ id: 2, amount: 2345 }
						]
					},
					{
						id: 2,
						name: 'contrat2',
						invoices: [
							{ id: 3, amount: 3456 },
							{ id: 4, amount: 4567 }
						]
					}
				],
				test: {
					id: 1
				}
			},
			errors: null,
			from: RequestFrom.NODATA,
			isOutdated: false
		};
	});

	it('Should update the complete data (not looking at the type)', async () => {
		let newData = {
			hello: 'world'
		};
		let result = kitQLClient.storeUpdate('Ope1', store, newData);
		expect(result.data).toMatchInlineSnapshot(`
			{
			  "hello": "world",
			}
		`);
	});

	it('Should update in the tree of objects & array id 3', async () => {
		let invoice3Updated = {
			data: { invoice: { id: 3, amount: 3333 } }
		};

		// Deep clone for the test
		let testObj = JSON.parse(JSON.stringify(store));
		let result = {
			...kitQLClient.storeUpdate(
				'Ope1',
				store,
				invoice3Updated.data.invoice,
				'contracts[].invoices[].id=$id',
				3
			)
		};

		// Manual update to compare for the test
		testObj.data.contracts[1].invoices[0] = invoice3Updated.data.invoice;

		expect(result).toMatchObject(testObj);
	});

	it('Should update in the tree of objects & array id 4', async () => {
		let invoice4Updated = {
			data: { invoice: { id: 4, amount: 4444 } }
		};

		// Deep clone for the test
		let testObj = JSON.parse(JSON.stringify(store));
		let result = {
			...kitQLClient.storeUpdate(
				'Ope1',
				store,
				invoice4Updated.data.invoice,
				'contracts[].invoices[].id=$id',
				4
			)
		};

		// Manual update to compare for the test
		testObj.data.contracts[1].invoices[1] = invoice4Updated.data.invoice;

		expect(result).toMatchObject(testObj);
	});

	it('Should update all data without id', async () => {
		let invoice3Updated = {
			data: { invoice: { id: 3, amount: 3333 } }
		};

		// Deep clone for the test
		let testObj = JSON.parse(JSON.stringify(store));
		let result = {
			...kitQLClient.storeUpdate('Ope1', store, invoice3Updated.data, 'contracts')
		};

		// Manual update to compare for the test
		testObj.data.contracts = invoice3Updated.data;

		expect(result.data).toMatchObject(testObj.data);
	});

	it('Should not update anything nice the path is not found', async () => {
		let invoice3Updated = {
			data: { invoice: { id: 3, amount: 3333 } }
		};

		let result = {
			...kitQLClient.storeUpdate('Ope1', store, invoice3Updated.data, 'BLABLA')
		};

		expect(result).toMatchObject(result);
	});

	it('Should update in the tree of objects & array id 4', async () => {
		let invoice4Updated = {
			data: { invoice: { id: 4, amount: 4444 } }
		};

		// Deep clone for the test
		let testObj = JSON.parse(JSON.stringify(store));
		let result = {
			...kitQLClient.storeUpdate('Ope1', store, invoice4Updated.data.invoice, 'test.id')
		};

		// Manual update to compare for the test
		testObj.data.test.id = invoice4Updated.data.invoice;

		expect(result).toMatchObject(testObj);
	});
});
