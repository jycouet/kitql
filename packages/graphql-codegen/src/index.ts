import { concatAST, OperationDefinitionNode } from 'graphql';
import { pascalCase } from 'change-case-all';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { convertFactory, getConfigValue } from '@graphql-codegen/visitor-plugin-common';

function getOperationSuffix(
	config: { [key: string]: any },
	node: OperationDefinitionNode | string,
	operationType: string
): string {
	const { omitOperationSuffix = false, dedupeOperationSuffix = false } = config || {};
	const operationName = typeof node === 'string' ? node : node.name ? node.name.value : '';
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

				// lines.push(`documentName: '${documentName}'`); // GetVersionDocument
				// lines.push(`operationType: '${operationType}'`); // Query
				// lines.push(`operationTypeSuffix: '${operationTypeSuffix}'`); // Query
				// lines.push(`operationResultType: '${operationResultType}'`); //GetVersionQuery
				// lines.push(`importOperationResultType: '${importOperationResultType}'`); //GetVersionQuery or Types.GetVersionQuery
				// lines.push(`operationVariablesTypes: '${operationVariablesTypes}'`); //GetVersionQueryVariables
				// lines.push(`importOperationVariablesTypes: '${importOperationVariablesTypes}'`); //GetVersionQueryVariables or Types.GetVersionQueryVariables
				// lines.push(`storeTypeName: '${storeTypeName}'`); //GetVersionQueryStore

				lines.push(`/**`);
				lines.push(` * Svetle Store with the latest \`${operationResultType}\` Operation`);
				lines.push(` */`);
				lines.push(
					`export const ${storeTypeName} = writable<RequestResult<${importOperationResultType}, ${importOperationVariablesTypes}>>(defaultStoreValue);`
				);
				lines.push(``);
				lines.push(`/**`);
				lines.push(` * For SSR, you need to provide 'fetch' from the load function`);
				lines.push(` * For the client you can avoid to provide the 'fetch' native function`);
				lines.push(` * @param params`);
				lines.push(
					` * @returns the latest ${operationResultType} operation and fill the ${storeTypeName}`
				);
				lines.push(` */`);
				lines.push(`// prettier-ignore`);
				lines.push(`export async function ${operationResultType}(`);
				lines.push(`  params?: RequestParameters<${importOperationVariablesTypes}>`);
				lines.push(
					`): Promise<RequestResult<${importOperationResultType}, ${importOperationVariablesTypes}>> {`
				);
				lines.push(``);
				lines.push(`  let storedVariables = null;`);
				lines.push(`	${storeTypeName}.update((c) => {`);
				lines.push(`		storedVariables = c.variables;`);
				lines.push(`		return { ...c, status: RequestStatus.LOADING };`);
				lines.push(`	});`);
				lines.push(`	let { fetch, variables, settings } = params || {};`);
				lines.push(`  let { cache } = settings || {};`);
				if (operationType === 'Mutation') {
					lines.push(`  cache = 0 // It's a Mutation!`);
				}
				lines.push(``);
				lines.push(`  if (variables === undefined) {`);
				lines.push(`    variables = storedVariables;`);
				lines.push(`  }`);

				lines.push(
					`	const res = await kitQLClient.request<${importOperationResultType}, ${importOperationVariablesTypes}>({`
				);
				lines.push(`		document: ${importDocumentName},`);
				lines.push(`		variables,`);
				lines.push(`		skFetch: fetch,`);
				lines.push(`		cacheKey: "${operationResultType}",`);
				lines.push(`		cache,`);
				lines.push(`		browser`);
				lines.push(`	});`);
				lines.push(`	const result = { status: RequestStatus.DONE, ...res, variables };`);
				lines.push(`	${storeTypeName}.set(result);`);
				lines.push(`	return result;`);
				lines.push(`}`);
				lines.push(``);

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
	prepend.push(`import { writable } from 'svelte/store';`);
	prepend.push(`import { kitQLClient } from '../kitQLClient';`);

	// To separate prepend & Content
	prepend.push(' ');

	return {
		prepend,
		content: out.filter(Boolean).join('\n')
	};
};
