import { browser } from '$app/env';
import * as Types from '$lib/graphql/generated/types';
import { defaultStoreValue, RequestStatus, type PatchType, type RequestQueryParameters, type RequestResult } from '@kitql/client';
import { get, writable } from 'svelte/store';
import { kitQLClient } from '../kitQLClient';
 
/* Internal. To skip await on a client side navigation in the load function (from queryLoad)! */
let clientStarted = false; // Will be true on a client side navigation
if (browser) {
	addEventListener('sveltekit:start', () => {
		clientStarted = true;
	});
}
 
/**
 * ResetAllCaches in One function!
 */
export function KQL__ResetAllCaches() {
	KQL_AllContinents.resetCache();
	KQL_AllCountriesOfContinent.resetCache();
}
 
/* Operations 👇 */
function KQL_AllContinentsStore() {
	const operationName = 'KQL_AllContinents';

	// prettier-ignore
	const { subscribe, set, update } = writable<RequestResult<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>>({...defaultStoreValue, operationName});

		async function queryLocal(
			params?: RequestQueryParameters<Types.AllContinentsQueryVariables>
		): Promise<RequestResult<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>> {
			let { fetch, variables, settings } = params ?? {};
			let { cacheMs, policy } = settings ?? {};

			const storedVariables = get(KQL_AllContinents).variables;
			variables = variables ?? storedVariables;
			policy = policy ?? kitQLClient.policy;

			// Cache only in the browser for now. In SSR, we will need session identif to not mix peoples data
			if (browser) {
				if (policy !== 'network-only') {
					// prettier-ignore
					const cachedData = kitQLClient.requestCache<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>({
						variables, operationName, cacheMs,	browser
					});
					if (cachedData) {
						const result = { ...cachedData, isFetching: false, status: RequestStatus.DONE };
						if (policy === 'cache-first') {
							set(result);
							if (!result.isOutdated) {
								return result;
							}
						} else if (policy === 'cache-only') {
							set(result);
							return result;
						} else if (policy === 'cache-and-network') {
							set(result);
						}
					}
				}
			}

			update((c) => {
				return { ...c, isFetching: true, status: RequestStatus.LOADING };
			});

			// prettier-ignore
			const res = await kitQLClient.request<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>({
				skFetch: fetch,
				document: Types.AllContinentsDocument,
				variables, 
				operationName, 
				browser
			});
			const result = { ...res, isFetching: false, status: RequestStatus.DONE, variables };
			set(result);
			return result;
		}

	return {
		subscribe,

		/**
		 * Can be used for SSR, but simpler option is `.queryLoad`
		 * @returns fill this store & the cache
		 */
		query: queryLocal,

		/**
		 * Ideal for SSR query. To be used in SvelteKit load function
		 * @returns fill this store & the cache
		 */
		queryLoad: async (
			params?: RequestQueryParameters<Types.AllContinentsQueryVariables>
		): Promise<void> => {
			if (clientStarted) {
				queryLocal(params); // No await in purpose, we are in a client navigation.
			} else {
				await queryLocal(params);
			}
		},

		/**
		 * Reset Cache
		 */
		resetCache(
			variables: Types.AllContinentsQueryVariables | null = null,
			allOperationKey: boolean = true,
			withResetStore: boolean = true
		) {
			kitQLClient.cacheRemove(operationName, { variables, allOperationKey });
			if (withResetStore) {
				set({ ...defaultStoreValue, operationName });
			}
		},

		/**
		 * Patch the store &&|| cache with some data.
		 */
		// prettier-ignore
		patch(data: Types.AllContinentsQuery, variables: Types.AllContinentsQueryVariables | null = null, type: PatchType = 'cache-and-store'): void {
			let updatedCacheStore = undefined;
			if(type === 'cache-only' || type === 'cache-and-store') {
				updatedCacheStore = kitQLClient.cacheUpdate<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>(operationName, data, { variables });
			}
			if(type === 'store-only' ) {
				let toReturn = { ...get(KQL_AllContinents), data, variables } ;
				set(toReturn);
			}
			if(type === 'cache-and-store' ) {
				set({...get(KQL_AllContinents), ...updatedCacheStore});
			}
			kitQLClient.logInfo(operationName, "patch", type);
		}
	};
}
/**
 * KitQL Svelte Store with the latest `AllContinents` Operation
 */
export const KQL_AllContinents = KQL_AllContinentsStore();

function KQL_AllCountriesOfContinentStore() {
	const operationName = 'KQL_AllCountriesOfContinent';

	// prettier-ignore
	const { subscribe, set, update } = writable<RequestResult<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>>({...defaultStoreValue, operationName});

		async function queryLocal(
			params?: RequestQueryParameters<Types.AllCountriesOfContinentQueryVariables>
		): Promise<RequestResult<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>> {
			let { fetch, variables, settings } = params ?? {};
			let { cacheMs, policy } = settings ?? {};

			const storedVariables = get(KQL_AllCountriesOfContinent).variables;
			variables = variables ?? storedVariables;
			policy = policy ?? kitQLClient.policy;

			// Cache only in the browser for now. In SSR, we will need session identif to not mix peoples data
			if (browser) {
				if (policy !== 'network-only') {
					// prettier-ignore
					const cachedData = kitQLClient.requestCache<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>({
						variables, operationName, cacheMs,	browser
					});
					if (cachedData) {
						const result = { ...cachedData, isFetching: false, status: RequestStatus.DONE };
						if (policy === 'cache-first') {
							set(result);
							if (!result.isOutdated) {
								return result;
							}
						} else if (policy === 'cache-only') {
							set(result);
							return result;
						} else if (policy === 'cache-and-network') {
							set(result);
						}
					}
				}
			}

			update((c) => {
				return { ...c, isFetching: true, status: RequestStatus.LOADING };
			});

			// prettier-ignore
			const res = await kitQLClient.request<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>({
				skFetch: fetch,
				document: Types.AllCountriesOfContinentDocument,
				variables, 
				operationName, 
				browser
			});
			const result = { ...res, isFetching: false, status: RequestStatus.DONE, variables };
			set(result);
			return result;
		}

	return {
		subscribe,

		/**
		 * Can be used for SSR, but simpler option is `.queryLoad`
		 * @returns fill this store & the cache
		 */
		query: queryLocal,

		/**
		 * Ideal for SSR query. To be used in SvelteKit load function
		 * @returns fill this store & the cache
		 */
		queryLoad: async (
			params?: RequestQueryParameters<Types.AllCountriesOfContinentQueryVariables>
		): Promise<void> => {
			if (clientStarted) {
				queryLocal(params); // No await in purpose, we are in a client navigation.
			} else {
				await queryLocal(params);
			}
		},

		/**
		 * Reset Cache
		 */
		resetCache(
			variables: Types.AllCountriesOfContinentQueryVariables | null = null,
			allOperationKey: boolean = true,
			withResetStore: boolean = true
		) {
			kitQLClient.cacheRemove(operationName, { variables, allOperationKey });
			if (withResetStore) {
				set({ ...defaultStoreValue, operationName });
			}
		},

		/**
		 * Patch the store &&|| cache with some data.
		 */
		// prettier-ignore
		patch(data: Types.AllCountriesOfContinentQuery, variables: Types.AllCountriesOfContinentQueryVariables | null = null, type: PatchType = 'cache-and-store'): void {
			let updatedCacheStore = undefined;
			if(type === 'cache-only' || type === 'cache-and-store') {
				updatedCacheStore = kitQLClient.cacheUpdate<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>(operationName, data, { variables });
			}
			if(type === 'store-only' ) {
				let toReturn = { ...get(KQL_AllCountriesOfContinent), data, variables } ;
				set(toReturn);
			}
			if(type === 'cache-and-store' ) {
				set({...get(KQL_AllCountriesOfContinent), ...updatedCacheStore});
			}
			kitQLClient.logInfo(operationName, "patch", type);
		}
	};
}
/**
 * KitQL Svelte Store with the latest `AllCountriesOfContinent` Operation
 */
export const KQL_AllCountriesOfContinent = KQL_AllCountriesOfContinentStore();
