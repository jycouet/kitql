import { concatAST, OperationDefinitionNode } from 'graphql';
import { pascalCase } from 'change-case-all';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { convertFactory, getConfigValue } from '@graphql-codegen/visitor-plugin-common';

function getOperationSuffix(
	config: { [key: string]: any },
	node: OperationDefinitionNode,
	operationType: string
): string {
	const { omitOperationSuffix = false, dedupeOperationSuffix = false } = config;
	const operationName = node.name.value;

	return omitOperationSuffix
		? ''
		: dedupeOperationSuffix && operationName.toLowerCase().endsWith(operationType.toLowerCase())
		? ''
		: operationType;
}

export const plugin: PluginFunction<Record<string, any>, Types.ComplexPluginOutput> = (
	schema,
	documents,
	config
) => {
	config = config ?? {};

	const allAst = concatAST(documents.map(v => v.document));
	const convertName = convertFactory(config);
	const operationResultSuffix = getConfigValue(config.operationResultSuffix, '');

	const prefixImportBaseTypesFrom = config.importBaseTypesFrom ? 'Types.' : '';

	const out = allAst.definitions
		.map(node => {
			if (node.kind === 'OperationDefinition' && node.name?.value) {
				const documentName = `${pascalCase(node.name?.value)}Document`;
				const importDocumentName = prefixImportBaseTypesFrom + documentName;

				const operationType: string = pascalCase(node.operation);
				const operationTypeSuffix: string = getOperationSuffix(config, node, operationType);
				const operationResultType: string = convertName(node, {
					suffix: operationTypeSuffix + operationResultSuffix
				});
				const importOperationResultType = prefixImportBaseTypesFrom + operationResultType;
				const operationVariablesTypes: string = convertName(node, {
					suffix: operationTypeSuffix + 'Variables'
				});
				const importOperationVariablesTypes = prefixImportBaseTypesFrom + operationVariablesTypes;

				const storeTypeName: string = convertName(node, {
					suffix: operationTypeSuffix + 'Store'
				});

				let lines = [];

				// lines.push(`documentName: '${documentName}'`); // AllContinentsDocument
				// lines.push(`operationType: '${operationType}'`); // Query
				// lines.push(`operationTypeSuffix: '${operationTypeSuffix}'`); // Query
				// lines.push(`operationResultType: '${operationResultType}'`); //AllContinentsQuery
				// lines.push(`importOperationResultType: '${importOperationResultType}'`); //AllContinentsQuery or Types.AllContinentsQuery
				// lines.push(`operationVariablesTypes: '${operationVariablesTypes}'`); //AllContinentsQueryVariables
				// lines.push(`importOperationVariablesTypes: '${importOperationVariablesTypes}'`); //AllContinentsQueryVariables or ${importOperationResultType}Variables
				// lines.push(`storeTypeName: '${storeTypeName}'`); //AllContinentsQueryStore

				// Store
				lines.push(`/**`);
				lines.push(` * KitQL Svelte Store with the latest \`${operationResultType}\` Operation`);
				lines.push(` */`);
				lines.push(`// prettier-ignore`);
				lines.push(
					`export const ${storeTypeName} = writable<RequestResult<${importOperationResultType}, ${importOperationVariablesTypes}>>(defaultStoreValue);`
				);
				lines.push(``);

				// Query / Mutation / Subscription

				lines.push(`/**`);
				lines.push(` * For SSR, you need to provide 'fetch' from the load function`);
				lines.push(` * For the client you can avoid to provide the 'fetch' native function`);
				lines.push(` * @param params`);
				lines.push(
					` * @returns the latest ${operationResultType} operation and fill the ${storeTypeName}`
				);
				lines.push(` */`);
				lines.push(`export async function ${operationResultType}(`);
				lines.push(`	params?: RequestParameters<${importOperationVariablesTypes}>`);
				lines.push(
					`): Promise<RequestResult<${importOperationResultType}, ${importOperationVariablesTypes}>> {`
				);
				lines.push(`	let { fetch, variables, settings } = params ?? {};`);
				lines.push(`	let { cache, policy } = settings ?? {};`);
				lines.push(`	const cacheKey = '${operationResultType}';`);
				lines.push(``);
				lines.push(`	const storedVariables = get(${storeTypeName}).variables;`);
				lines.push(`	variables = variables ?? storedVariables;`);
				lines.push(`	policy = policy ?? kitQLClient.defaultPolicy;`);
				lines.push(``);
				// Cache ony for queries
				if (operationType === 'Query') {
					lines.push(
						`// Cache only in the browser for now. In SSR, we will need session identif to not mix peoples data`
					);
					lines.push(`if (browser) {`);
					lines.push(`	if (policy !== 'network-only') {`);
					lines.push(`		// prettier-ignore`);
					lines.push(
						`		const cachedData = kitQLClient.requestCache<${importOperationResultType}, ${importOperationVariablesTypes}>({`
					);
					lines.push(`			variables, cacheKey, cache,	browser`);
					lines.push(`		});`);
					lines.push(`		if (cachedData) {`);
					lines.push(
						`			const result = { ...cachedData, isFetching: false, status: RequestStatus.DONE };`
					);
					lines.push(`			if (policy === 'cache-first') {`);
					lines.push(`				${storeTypeName}.set(result);`);
					lines.push(`				if (!result.isOutdated) {`);
					lines.push(`					return result;`);
					lines.push(`				}`);
					lines.push(`			} else if (policy === 'cache-only') {`);
					lines.push(`				${storeTypeName}.set(result);`);
					lines.push(`				return result;`);
					lines.push(`			} else if (policy === 'cache-and-network') {`);
					lines.push(`				${storeTypeName}.set(result);`);
					lines.push(`			}`);
					lines.push(`		}`);
					lines.push(`	}`);
					lines.push(`}`);
				}
				lines.push(`	${storeTypeName}.update((c) => {`);
				lines.push(`		return { ...c, isFetching: true, status: RequestStatus.LOADING };`);
				lines.push(`	});`);
				lines.push(``);
				lines.push(`	// prettier-ignore`);
				lines.push(
					`	const res = await kitQLClient.request<${importOperationResultType}, ${importOperationVariablesTypes}>({`
				);
				lines.push(`		skFetch: fetch,`);
				lines.push(`		document: Types.${documentName},`);
				lines.push(`		variables, `);
				lines.push(`		cacheKey, `);
				lines.push(`		browser`);
				lines.push(`	});`);
				lines.push(
					`	const result = { ...res, isFetching: false, status: RequestStatus.DONE, variables };`
				);
				lines.push(`	${storeTypeName}.set(result);`);
				lines.push(`	return result;`);
				lines.push(`}`);
				lines.push(``);

				if (operationType === 'Query') {
					// CacheReset
					lines.push(`/**`);
					lines.push(` * KitQL Reset Cache for \`${operationResultType}\` Operation`);
					lines.push(` */`);
					lines.push(`export function ${operationResultType}CacheReset(`);
					lines.push(`	variables: ${importOperationVariablesTypes} | null = null,`);
					lines.push(`	allOperationKey: boolean = true,`);
					lines.push(`	withResetStore: boolean = true`);
					lines.push(`) {`);
					lines.push(
						`	kitQLClient.cacheRemove('${operationResultType}', { variables, allOperationKey });`
					);
					lines.push(`	if (withResetStore) {`);
					lines.push(`		${storeTypeName}.set(defaultStoreValue);`);
					lines.push(`	}`);
					lines.push(`}`);
					lines.push(``);

					// StoreUpdate
					lines.push(`/**`);
					lines.push(` * KitQL Update \`${storeTypeName}\` with some new data to put in xPath`);
					lines.push(` * @param xPath eg: 'post' 'contracts[].invoices[].id=$id'`);
					lines.push(` */`);
					lines.push(`export function ${storeTypeName}Update(`);
					lines.push(`	newData: Object,`);
					lines.push(`	xPath: string | null = null,`);
					lines.push(`	id: string | number | null = null`);
					lines.push(`) {`);
					lines.push(`	const updatedStore = kitQLClient.storeUpdate<`);
					lines.push(`		${importOperationResultType},`);
					lines.push(`		${importOperationVariablesTypes}`);
					lines.push(`	>('${operationResultType}', get(${storeTypeName}), newData, xPath, id);`);
					lines.push(`	${storeTypeName}.set(updatedStore);`);
					lines.push(`}`);
					lines.push(``);
				}

				return lines.join('\n');
			}

			return null;
		})
		.filter(Boolean);

	let prepend = [];
	prepend.push(`import { browser } from '$app/env';`);
	if (config.importBaseTypesFrom) {
		prepend.push(`import * as Types from "${config.importBaseTypesFrom}";`);
	}
	prepend.push(
		`import { defaultStoreValue, RequestStatus, type RequestParameters, type RequestResult } from '@kitql/client';`
	);
	prepend.push(`import { get, writable } from 'svelte/store';`);
	prepend.push(`import { kitQLClient } from '../kitQLClient';`);

	// To separate prepend & Content
	prepend.push(' ');

	return {
		prepend,
		content: out.filter(Boolean).join('\n')
	};
};
