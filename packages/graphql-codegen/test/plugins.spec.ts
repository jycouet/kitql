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
		document: parse(`query { id }`)
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
			`import { defaultStoreValue, RequestStatus, type RequestParameters, type RequestResult } from '@kitql/client';`
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

		expect(result.prepend).toContain(`import * as Types from "$graphql/_gen/graphqlTypes";`);

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
});
