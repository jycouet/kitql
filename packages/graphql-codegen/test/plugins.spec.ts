import { Types } from '@graphql-codegen/plugin-helpers';
import { parse } from 'graphql';
import { plugin } from '../src';
import { assert, describe, expect, it } from 'vitest';

const operations = [
	{
		document: parse(`query me { id }`)
	},
	{
		document: parse(`mutation doSomething { id }`)
	},
	{
		document: parse(`query GetQuery { id }`)
	},
	{
		document: parse(`fragment Test on Test { t }`)
	}
];

describe('graphql-codegen', () => {
	it('Should have a reference to browser', async () => {
		const result = (await plugin(null as any, operations, {})) as Types.ComplexPluginOutput;
		expect(result.prepend).toContain(`import { browser } from '$app/env';`);
	});

	it('Should import from @kitql/client', async () => {
		const result = (await plugin(null as any, operations, {})) as Types.ComplexPluginOutput;
		expect(result.prepend).toContain(
			`import { defaultStoreValue, RequestStatus, type RequestParameters, type RequestQueryParameters, type RequestResult } from '@kitql/client';`
		);
	});

	it('Should import from @kitql/client WO Types', async () => {
		const result = (await plugin(null as any, operations, {
			jsDocStyle: true
		})) as Types.ComplexPluginOutput;
		expect(result.prepend).toContain(
			`import { defaultStoreValue, RequestStatus } from '@kitql/client';`
		);
	});

	it('Should look for the instance of kitQLClient', async () => {
		const result = (await plugin(null as any, operations, {})) as Types.ComplexPluginOutput;
		expect(result.prepend).toContain(`import { kitQLClient } from '../kitQLClient';`);
	});

	it('Without importBaseTypesFrom, should not import Types', async () => {
		const result = (await plugin(null as any, operations, {})) as Types.ComplexPluginOutput;
		expect(result.content).toContain(
			'writable<RequestResult<DoSomethingMutation, DoSomethingMutationVariables>>'
		);
		expect(result.content).toContain('params?: RequestParameters<DoSomethingMutationVariables>');
		expect(result.content).toContain(
			'Promise<RequestResult<DoSomethingMutation, DoSomethingMutationVariables>>'
		);
	});

	it('With importBaseTypesFrom, should import Types', async () => {
		const result = (await plugin(null as any, operations, {
			importBaseTypesFrom: '$graphql/_gen/graphqlTypes'
		})) as Types.ComplexPluginOutput;

		expect(result.prepend).toContain(`import * as Types from '$graphql/_gen/graphqlTypes';`);

		expect(result.content).toContain(
			'writable<RequestResult<Types.DoSomethingMutation, Types.DoSomethingMutationVariables>>'
		);
		expect(result.content).toContain(
			'params?: RequestParameters<Types.DoSomethingMutationVariables>'
		);
		expect(result.content).toContain(
			'Promise<RequestResult<Types.DoSomethingMutation, Types.DoSomethingMutationVariables>>'
		);
	});

	it('With no config, it should still work', async () => {
		const result = (await plugin(null as any, operations, undefined)) as Types.ComplexPluginOutput;
		expect(result.prepend).not.toBe(null);
		expect(result.content).not.toBe(null);

		const result2 = (await plugin(null as any, operations, null)) as Types.ComplexPluginOutput;
		expect(result2.prepend).not.toBe(null);
		expect(result2.content).not.toBe(null);
	});

	it('config dedupeOperationSuffix, should dedupe Operation Suffix', async () => {
		// But heuu... I don't know what operation to do to test this.
		const result = (await plugin(null as any, operations, {
			omitOperationSuffix: false,
			dedupeOperationSuffix: true
		})) as Types.ComplexPluginOutput;

		expect(result.prepend).not.toBe(null);
		expect(result.content).not.toBe(null);
	});
});
