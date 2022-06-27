import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers'
import { convertFactory, getConfigValue } from '@graphql-codegen/visitor-plugin-common'
import { concatAST, OperationDefinitionNode } from 'graphql'

function getOperationSuffix(
  config: { [key: string]: any },
  node: OperationDefinitionNode,
  operationType: string
): string {
  const { omitOperationSuffix = false, dedupeOperationSuffix = false } = config
  const operationName = node.name.value

  return omitOperationSuffix
    ? ''
    : dedupeOperationSuffix && operationName.toLowerCase().endsWith(operationType.toLowerCase())
      ? ''
      : operationType
}

export const plugin: PluginFunction<Record<string, any>, Types.ComplexPluginOutput> = (schema, documents, config) => {
  config = config ?? {}

  console.info('This lib was deprecated check https://www.kitql.dev/docs/migrating-to-0.7.0 to upgrade.')

  const allAst = concatAST(documents.map(v => v.document))
  const convertName = convertFactory(config)
  const operationResultSuffix = getConfigValue(config.operationResultSuffix, '')
  const operationPrefix = getConfigValue(config.operationPrefix, 'KQL_')
  const jsDocStyle: boolean = getConfigValue(config.jsDocStyle, false)
  // ${jsDocStyle ? `` : ``}
  const clientPath = getConfigValue(config.clientPath, '../kitQLClient')

  const prefixImportBaseTypesFrom = config.importBaseTypesFrom ? 'Types.' : ''

  const kqlStoresQuery = []
  const kqlStoresMutation = []

  const out = allAst.definitions
    .map(node => {
      if (node.kind === 'OperationDefinition' && node.name?.value && node.operation !== 'subscription') {
        const operationName = convertName(node.name?.value) // AllContinents
        const kqlStore = `${operationPrefix}${operationName}` // KQL_AllContinents
        const kqlStoreInternal = `${operationPrefix}${operationName}Store` // KQL_AllContinentsStore
        const operationString = convertName(node.operation) // Query Mutation Subscription
        const operationTypeSuffix: string = getOperationSuffix(config, node, operationString)
        const operationResultType: string = convertName(node, {
          suffix: operationTypeSuffix + operationResultSuffix,
        })
        const kqltypeQuery = `${prefixImportBaseTypesFrom}${operationResultType}` // Types.AllContinentsQuery
        const kqltypeVariable = `${kqltypeQuery}Variables` // Types.AllContinentsQueryVariables
        const kqltypeQueryAndVariable = `${kqltypeQuery}, ${kqltypeVariable}` // Types.AllContinentsQuery, Types.AllContinentsQueryVariables
        const kqltypeDocument = `${prefixImportBaseTypesFrom}${operationName}Document` // Types.AllContinentsDocument
        const fnKeyword = node.operation === 'query' ? 'query' : node.operation === 'mutation' ? 'mutate' : 'sub'

        if (node.operation === 'query') {
          kqlStoresQuery.push(kqlStore)
        }
        if (node.operation === 'mutation') {
          kqlStoresMutation.push(kqlStore)
        }

        const lines = []
        lines.push(`function ${kqlStoreInternal}() {`)
        lines.push(`	const operationName = '${kqlStore}';`)
        lines.push(`	const operationType = ResponseResultType.${node.operation === 'query' ? 'Query' : 'Mutation'};`)
        lines.push(``)
        lines.push(`	// prettier-ignore`)
        lines.push(
          `	const { subscribe, set, update } = writable${jsDocStyle ? `` : `<RequestResult<${kqltypeQueryAndVariable}>>`
          }({...defaultStoreValue, operationName, operationType});`
        )

        lines.push(``)

        lines.push(`		async function ${fnKeyword}Local(`)
        // prettier-ignore
        lines.push(`			params${jsDocStyle ? `` : `?: Request${node.operation === 'query' ? 'Query' : ''}Parameters<${kqltypeVariable}>`}`);
        lines.push(`		)${jsDocStyle ? `` : `: Promise<RequestResult<${kqltypeQueryAndVariable}>>`} {`)
        // prettier-ignore
        lines.push(`			let { fetch, variables${node.operation === 'query' ? ', settings' : ''} } = params ?? {};`);
        if (node.operation === 'query') {
          lines.push(`			let { cacheMs, policy } = settings ?? {};`)
        }
        lines.push(``)
        lines.push(`			const storedVariables = get(${kqlStore}).variables;`)
        lines.push(`			variables = variables ?? storedVariables;`)
        if (node.operation === 'query') {
          lines.push(`			policy = policy ?? kitQLClient.policy;`)
        }
        lines.push(``)

        if (node.operation === 'query') {
          lines.push(
            `			// Cache only in the browser for now. In SSR, we will need session identif to not mix peoples data`
          )
          lines.push(`			if (${jsDocStyle ? `true` : `browser`}) {`)
          lines.push(`				if (policy !== 'network-only') {`)
          lines.push(`					// prettier-ignore`)
          // prettier-ignore
          lines.push(`					const cachedData = kitQLClient.requestCache${jsDocStyle ? `` : `<${kqltypeQueryAndVariable}>`}({`);
          lines.push(`						variables, operationName, cacheMs,	${jsDocStyle ? `browser: true` : `browser`}`)
          lines.push(`					});`)
          lines.push(`					if (cachedData) {`)
          lines.push(`						const result = { ...cachedData, isFetching: false, status: RequestStatus.DONE };`)
          lines.push(`						if (policy === 'cache-first') {`)
          lines.push(`							set(result);`)
          lines.push(`							if (!result.isOutdated) {`)
          lines.push(`								return result;`)
          lines.push(`							}`)
          lines.push(`						} else if (policy === 'cache-only') {`)
          lines.push(`							set(result);`)
          lines.push(`							return result;`)
          lines.push(`						} else if (policy === 'cache-and-network') {`)
          lines.push(`							set(result);`)
          lines.push(`						}`)
          lines.push(`					}`)
          lines.push(`				}`)
          lines.push(`			}`)
          lines.push(``)
        }

        lines.push(`			update((c) => {`)
        lines.push(`				return { ...c, isFetching: true, status: RequestStatus.LOADING };`)
        lines.push(`			});`)
        lines.push(``)
        lines.push(`			// prettier-ignore`)
        lines.push(`			const res = await kitQLClient.request${jsDocStyle ? `` : `<${kqltypeQueryAndVariable}>`}({`)
        lines.push(`				skFetch: fetch,`)
        lines.push(`				document: ${kqltypeDocument},`)
        lines.push(`				variables, `)
        lines.push(`				operationName, `)
        lines.push(`				operationType, `)
        lines.push(`				${jsDocStyle ? `browser: true` : `browser`}`)
        lines.push(`			});`)
        lines.push(`			const result = { ...res, isFetching: false, status: RequestStatus.DONE, variables };`)
        lines.push(`			set(result);`)
        lines.push(`			return result;`)
        lines.push(`		}`)

        lines.push(``)
        lines.push(`	return {`)
        lines.push(`		subscribe,`)

        lines.push(``)

        // Query & Mutation
        lines.push(`		/**`)
        lines.push(`		 * Can be used for SSR, but simpler option is \`.queryLoad\``)
        lines.push(`		 * @returns fill this store & the cache`)
        lines.push(`		 */`)
        lines.push(`		${fnKeyword}: ${fnKeyword}Local,`)
        lines.push(``)

        if (node.operation === 'query') {
          lines.push(`		/**`)
          lines.push(`		 * Ideal for SSR query. To be used in SvelteKit load function`)
          lines.push(`		 * @returns fill this store & the cache`)
          lines.push(`		 */`)
          lines.push(`		queryLoad: async (`)
          lines.push(`			params?: RequestQueryParameters<${kqltypeVariable}>`)
          lines.push(`		): Promise<void> => {`)
          lines.push(`			if (clientStarted) {`)
          lines.push(`				queryLocal(params); // No await on purpose, we are in a client navigation.`)
          lines.push(`			} else {`)
          lines.push(`				await queryLocal(params);`)
          lines.push(`			}`)
          lines.push(`		},`)
        }

        if (node.operation === 'query') {
          // Reset Cache
          lines.push(``)
          lines.push(`		/**`)
          lines.push(`		 * Reset Cache`)
          lines.push(`		 */`)
          lines.push(`		resetCache(`)
          lines.push(`			variables${jsDocStyle ? `` : `: ${kqltypeVariable} | null = null`},`)
          lines.push(`			allOperationKey${jsDocStyle ? `` : `: boolean = true`},`)
          lines.push(`			withResetStore${jsDocStyle ? `` : `: boolean = true`}`)
          lines.push(`		) {`)
          lines.push(`			kitQLClient.cacheRemove(operationName, { variables, allOperationKey });`)
          lines.push(`			if (withResetStore) {`)
          lines.push(`				set({ ...defaultStoreValue, operationName });`)
          lines.push(`			}`)
          lines.push(`		},`)
        }

        if (node.operation === 'query') {
          lines.push(``)
          lines.push(`		/**`)
          lines.push(`		 * Patch the store &&|| cache with some data.`)
          lines.push(`		 */`)
          lines.push(`		// prettier-ignore`)
          lines.push(
            `		patch(data: ${kqltypeQuery}, variables: ${kqltypeVariable} | null = null, type: PatchType = 'cache-and-store'): void {`
          )
          lines.push(`			let updatedCacheStore = undefined;`)
          lines.push(`			if(type === 'cache-only' || type === 'cache-and-store') {`)
          lines.push(
            `				updatedCacheStore = kitQLClient.cacheUpdate<${kqltypeQueryAndVariable}>(operationName, data, { variables });`
          )
          lines.push(`			}`)
          lines.push(`			if(type === 'store-only' ) {`)
          lines.push(`				let toReturn = { ...get(${kqlStore}), data, variables } ;`)
          lines.push(`				set(toReturn);`)
          lines.push(`			}`)
          lines.push(`			if(type === 'cache-and-store' ) {`)
          lines.push(`				set({...get(${kqlStore}), ...updatedCacheStore});`)
          lines.push(`			}`)
          lines.push(`			kitQLClient.logInfo(operationName, "patch", type);`)
          lines.push(`		}`)
        }

        lines.push(`	};`)
        lines.push(`}`)
        lines.push(`/**`)
        lines.push(` * KitQL Svelte Store with the latest \`${operationName}\` Operation`)
        lines.push(` */`)
        lines.push(`export const ${kqlStore} = ${kqlStoreInternal}();`)
        lines.push(``)

        return lines.join('\n')
      }

      return null
    })
    .filter(Boolean)

  const special = []
  special.push(`/**`)
  special.push(` * Init KitQL (to have clientStarted = true!)`)
  special.push(` *`)
  special.push(` * Waiting for: https://github.com/sveltejs/kit/issues/4447`)
  special.push(` */`)
  special.push(`export function KQL__Init() {}`)

  special.push(' ')

  special.push(`/* Internal. To skip await on a client side navigation in the load function (from queryLoad)! */`)
  special.push(`let clientStarted = false; // Will be true on a client side navigation`)
  special.push(`if (browser) {`)
  special.push(`	addEventListener('sveltekit:start', () => {`)
  special.push(`		clientStarted = true;`)
  special.push(`	});`)
  special.push(`}`)

  special.push(' ')

  special.push(`/**`)
  special.push(` * ResetAllCaches in One function!`)
  special.push(` */`)
  special.push(`export function ${operationPrefix}_ResetAllCaches() {`)
  for (let i = 0; i < kqlStoresQuery.length; i++) {
    const kqlStoreQuery = kqlStoresQuery[i]
    special.push(`\t${kqlStoreQuery}.resetCache();`)
  }
  special.push('}')
  special.push(' ')

  special.push(`/* Operations 👇 */`)
  const prepend = []
  if (!jsDocStyle) {
    prepend.push(`import { browser } from '$app/env';`)
  }
  if (config.importBaseTypesFrom) {
    prepend.push(`import * as Types from '${config.importBaseTypesFrom}';`)
  }
  prepend.push(
    `import { defaultStoreValue, RequestStatus, ResponseResultType` +
    `${jsDocStyle
      ? ``
      : `, type PatchType${kqlStoresMutation.length > 0 ? ', type RequestParameters' : ''
      }, type RequestQueryParameters, type RequestResult`
    } } from '@kitql/client';`
  )
  prepend.push(`import { get, writable } from 'svelte/store';`)
  prepend.push(`import { kitQLClient } from '${clientPath}';`)

  prepend.push(' ')

  return {
    prepend,
    content: [...special, ...out].filter(Boolean).join('\n'),
  }
}
