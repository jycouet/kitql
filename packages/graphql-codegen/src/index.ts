import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { convertFactory, getConfigValue } from '@graphql-codegen/visitor-plugin-common';
import { pascalCase } from 'change-case-all';
import { concatAST, OperationDefinitionNode } from 'graphql';

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
	const operationPrefix = getConfigValue(config.operationPrefix, 'KQL_');
	const jsDocStyle: boolean = getConfigValue(config.jsDocStyle, false);
	// ${jsDocStyle ? `` : ``}
	const clientPath = getConfigValue(config.clientPath, '../kitQLClient');

	const prefixImportBaseTypesFrom = config.importBaseTypesFrom ? 'Types.' : '';

	let kqlStoresQuery = [];

	const out = allAst.definitions
		.map(node => {
			if (
				node.kind === 'OperationDefinition' &&
				node.name?.value &&
				node.operation !== 'subscription'
			) {
				const operationName = pascalCase(node.name?.value); // AllContinents
				const kqlStore = `${operationPrefix}${operationName}`; // KQL_AllContinents
				const kqlStoreInternal = `${operationPrefix}${operationName}Store`; // KQL_AllContinentsStore
				const operationString = pascalCase(node.operation); // Query Mutation Subscription
				const operationTypeSuffix: string = getOperationSuffix(config, node, operationString);
				const operationResultType: string = convertName(node, {
					suffix: operationTypeSuffix + operationResultSuffix
				});
				// const kqltypeQuery = `${prefixImportBaseTypesFrom}${operationName}${operationString}`; // Types.AllContinentsQuery
				const kqltypeQuery = `${prefixImportBaseTypesFrom}${operationResultType}`; // Types.AllContinentsQuery
				const kqltypeVariable = `${kqltypeQuery}Variables`; // Types.AllContinentsQueryVariables
				const kqltypeQueryAndVariable = `${kqltypeQuery}, ${kqltypeVariable}`; // Types.AllContinentsQuery, Types.AllContinentsQueryVariables
				const kqltypeDocument = `${prefixImportBaseTypesFrom}${operationName}Document`; // Types.AllContinentsDocument
				const fnKeyword =
					node.operation === 'query' ? 'query' : node.operation === 'mutation' ? 'mutate' : 'sub';

				if (node.operation === 'query') {
					kqlStoresQuery.push(kqlStore);
				}

				let lines = [];
				lines.push(`function ${kqlStoreInternal}() {`);
				lines.push(`	// prettier-ignore`);
				lines.push(
					`	const { subscribe, set, update } = writable${
						jsDocStyle ? `` : `<RequestResult<${kqltypeQueryAndVariable}>>`
					}(defaultStoreValue);`
				);
				lines.push(``);
				lines.push(`	const operationName = '${kqlStore}';`);
				lines.push(``);
				lines.push(`	return {`);
				lines.push(`		subscribe,`);

				// Query
				lines.push(`		/**`);
				lines.push(`		 * For SSR, you need to provide 'fetch' from the load function`);
				lines.push(`		 * @returns the latest operation and fill this store`);
				lines.push(`		 */`);
				lines.push(`		${fnKeyword}: async (`);
				// prettier-ignore
				lines.push(`			params${jsDocStyle ? `` : `?: Request${node.operation === 'query' ? 'Query': ''}Parameters<${kqltypeVariable}>`}`);
				lines.push(
					`		)${jsDocStyle ? `` : `: Promise<RequestResult<${kqltypeQueryAndVariable}>>`} => {`
				);
				// prettier-ignore
				lines.push(`			let { fetch, variables${node.operation === 'query' ? ', settings': ''} } = params ?? {};`);
				if (node.operation === 'query') {
					lines.push(`			let { cacheMs, policy } = settings ?? {};`);
				}
				lines.push(``);
				lines.push(`			const storedVariables = get(${kqlStore}).variables;`);
				lines.push(`			variables = variables ?? storedVariables;`);
				if (node.operation === 'query') {
					lines.push(`			policy = policy ?? kitQLClient.policy;`);
				}
				lines.push(``);

				if (node.operation === 'query') {
					lines.push(
						`			// Cache only in the browser for now. In SSR, we will need session identif to not mix peoples data`
					);
					lines.push(`			if (${jsDocStyle ? `true` : `browser`}) {`);
					lines.push(`				if (policy !== 'network-only') {`);
					lines.push(`					// prettier-ignore`);
					// prettier-ignore
					lines.push(`					const cachedData = kitQLClient.requestCache${jsDocStyle ? `` : `<${kqltypeQueryAndVariable}>`}({`);
					lines.push(
						`						variables, operationName, cacheMs,	${jsDocStyle ? `browser: true` : `browser`}`
					);
					lines.push(`					});`);
					lines.push(`					if (cachedData) {`);
					lines.push(
						`						const result = { ...cachedData, isFetching: false, status: RequestStatus.DONE };`
					);
					lines.push(`						if (policy === 'cache-first') {`);
					lines.push(`							set(result);`);
					lines.push(`							if (!result.isOutdated) {`);
					lines.push(`								return result;`);
					lines.push(`							}`);
					lines.push(`						} else if (policy === 'cache-only') {`);
					lines.push(`							set(result);`);
					lines.push(`							return result;`);
					lines.push(`						} else if (policy === 'cache-and-network') {`);
					lines.push(`							set(result);`);
					lines.push(`						}`);
					lines.push(`					}`);
					lines.push(`				}`);
					lines.push(`			}`);
					lines.push(``);
				}

				lines.push(`			update((c) => {`);
				lines.push(`				return { ...c, isFetching: true, status: RequestStatus.LOADING };`);
				lines.push(`			});`);
				lines.push(``);
				lines.push(`			// prettier-ignore`);
				lines.push(
					`			const res = await kitQLClient.request${
						jsDocStyle ? `` : `<${kqltypeQueryAndVariable}>`
					}({`
				);
				lines.push(`				skFetch: fetch,`);
				lines.push(`				document: ${kqltypeDocument},`);
				lines.push(`				variables, `);
				lines.push(`				operationName, `);
				lines.push(`				${jsDocStyle ? `browser: true` : `browser`}`);
				lines.push(`			});`);
				lines.push(
					`			const result = { ...res, isFetching: false, status: RequestStatus.DONE, variables };`
				);
				lines.push(`			set(result);`);
				lines.push(`			return result;`);
				lines.push(`		},`);

				if (node.operation === 'query') {
					// Reset Cache
					lines.push(`		/**`);
					lines.push(`		 * Reset Cache`);
					lines.push(`		 */`);
					lines.push(`		resetCache(`);
					lines.push(`			variables${jsDocStyle ? `` : `: ${kqltypeVariable} | null = null`},`);
					lines.push(`			allOperationKey${jsDocStyle ? `` : `: boolean = true`},`);
					lines.push(`			withResetStore${jsDocStyle ? `` : `: boolean = true`}`);
					lines.push(`		) {`);
					lines.push(`			kitQLClient.cacheRemove(operationName, { variables, allOperationKey });`);
					lines.push(`			if (withResetStore) {`);
					lines.push(`				set(defaultStoreValue);`);
					lines.push(`			}`);
					lines.push(`		},`);
				}

				if (node.operation === 'query') {
					// Patch // Todo, with existing fragment only!
					lines.push(`		/**`);
					lines.push(`		 * Patch the store with a new object at the dedicated xPath location`);
					lines.push(`		 */`);
					lines.push(
						`		patch(newData${jsDocStyle ? `` : `: Object`}, xPath${
							jsDocStyle ? `` : `: string | null = null`
						}) {`
					);
					lines.push(`			// prettier-ignore`);
					// prettier-ignore
					lines.push(
						`			const updatedStore = kitQLClient.patch${jsDocStyle ? `` : `<${kqltypeQueryAndVariable}>`}(operationName, get(${kqlStore}), newData, xPath);`
					);
					lines.push(`			set(updatedStore);`);
					lines.push(`			return updatedStore;`);
					lines.push(`		}`);
				}

				lines.push(`	};`);
				lines.push(`}`);
				lines.push(`/**`);
				lines.push(` * KitQL Svelte Store with the latest \`${operationName}\` Operation`);
				lines.push(` */`);
				lines.push(`export const ${kqlStore} = ${kqlStoreInternal}();`);
				lines.push(``);

				return lines.join('\n');
			}

			return null;
		})
		.filter(Boolean);

	let prepend = [];
	if (!jsDocStyle) {
		prepend.push(`import { browser } from '$app/env';`);
	}
	if (config.importBaseTypesFrom) {
		prepend.push(`import * as Types from '${config.importBaseTypesFrom}';`);
	}
	prepend.push(
		`import { defaultStoreValue, RequestStatus` +
			`${
				jsDocStyle
					? ``
					: `, type RequestParameters, type RequestQueryParameters, type RequestResult`
			} } from '@kitql/client';`
	);
	prepend.push(`import { get, writable } from 'svelte/store';`);
	prepend.push(`import { kitQLClient } from '${clientPath}';`);

	// To separate prepend & Content
	prepend.push('');

	// Adding a global ResetAllCaches
	prepend.push(`export function ${operationPrefix}_ResetAllCaches() {`);
	for (let i = 0; i < kqlStoresQuery.length; i++) {
		const kqlStoreQuery = kqlStoresQuery[i];
		prepend.push(`\t${kqlStoreQuery}.resetCache();`);
	}
	prepend.push('}');

	// To separate prepend & Content
	prepend.push('');

	return {
		prepend,
		content: out.filter(Boolean).join('\n')
	};
};
