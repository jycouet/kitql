import { browser } from '$app/env';
import * as Types from "$lib/graphql/_kitql/graphqlTypes";
import { defaultStoreValue, RequestStatus, type RequestParameters, type RequestResult } from '@kitql/client';
import { get, writable } from 'svelte/store';
import { kitQLClient } from '../kitQLClient';
 
function KQL_AllContinentsStore() {
	// prettier-ignore
	const { subscribe, set, update } = writable<RequestResult<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>>(defaultStoreValue);

	const cacheKey = 'KQL_AllContinents';

	return {
		subscribe,
		/**
		 * For SSR, you need to provide 'fetch' from the load function
		 * @returns the latest operation and fill this store
		 */
		query: async (
			params?: RequestParameters<Types.AllContinentsQueryVariables>
		): Promise<RequestResult<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>> => {
			let { fetch, variables, settings } = params ?? {};
			let { cache, policy } = settings ?? {};

			const storedVariables = get(KQL_AllContinents).variables;
			variables = variables ?? storedVariables;
			policy = policy ?? kitQLClient.defaultPolicy;

			// Cache only in the browser for now. In SSR, we will need session identif to not mix peoples data
			if (browser) {
				if (policy !== 'network-only') {
					// prettier-ignore
					const cachedData = kitQLClient.requestCache<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>({
						variables, cacheKey, cache,	browser
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
				cacheKey, 
				browser
			});
			const result = { ...res, isFetching: false, status: RequestStatus.DONE, variables };
			set(result);
			return result;
		},
		/**
		 * Reset Cache
		 */
		resetCache(
			variables: Types.AllContinentsQueryVariables | null = null,
			allOperationKey: boolean = true,
			withResetStore: boolean = true
		) {
			kitQLClient.cacheRemove(cacheKey, { variables, allOperationKey });
			if (withResetStore) {
				set(defaultStoreValue);
			}
		},
		/**
		 * Patch the store with a new object at the dedicated xPath location
		 */
		patch(newData: Object, xPath: string | null = null, id: string | number | null = null) {
			// prettier-ignore
			const updatedStore = kitQLClient.storeUpdate<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>(cacheKey, get(KQL_AllContinents), newData, xPath, id);
			set(updatedStore);
			return updatedStore;
		},
	};
}
/**
 * KitQL Svelte Store with the latest `AllContinents` Operation
 */
export const KQL_AllContinents = KQL_AllContinentsStore();

function KQL_AllCountriesOfContinentStore() {
	// prettier-ignore
	const { subscribe, set, update } = writable<RequestResult<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>>(defaultStoreValue);

	const cacheKey = 'KQL_AllCountriesOfContinent';

	return {
		subscribe,
		/**
		 * For SSR, you need to provide 'fetch' from the load function
		 * @returns the latest operation and fill this store
		 */
		query: async (
			params?: RequestParameters<Types.AllCountriesOfContinentQueryVariables>
		): Promise<RequestResult<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>> => {
			let { fetch, variables, settings } = params ?? {};
			let { cache, policy } = settings ?? {};

			const storedVariables = get(KQL_AllCountriesOfContinent).variables;
			variables = variables ?? storedVariables;
			policy = policy ?? kitQLClient.defaultPolicy;

			// Cache only in the browser for now. In SSR, we will need session identif to not mix peoples data
			if (browser) {
				if (policy !== 'network-only') {
					// prettier-ignore
					const cachedData = kitQLClient.requestCache<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>({
						variables, cacheKey, cache,	browser
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
				cacheKey, 
				browser
			});
			const result = { ...res, isFetching: false, status: RequestStatus.DONE, variables };
			set(result);
			return result;
		},
		/**
		 * Reset Cache
		 */
		resetCache(
			variables: Types.AllCountriesOfContinentQueryVariables | null = null,
			allOperationKey: boolean = true,
			withResetStore: boolean = true
		) {
			kitQLClient.cacheRemove(cacheKey, { variables, allOperationKey });
			if (withResetStore) {
				set(defaultStoreValue);
			}
		},
		/**
		 * Patch the store with a new object at the dedicated xPath location
		 */
		patch(newData: Object, xPath: string | null = null, id: string | number | null = null) {
			// prettier-ignore
			const updatedStore = kitQLClient.storeUpdate<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>(cacheKey, get(KQL_AllCountriesOfContinent), newData, xPath, id);
			set(updatedStore);
			return updatedStore;
		},
	};
}
/**
 * KitQL Svelte Store with the latest `AllCountriesOfContinent` Operation
 */
export const KQL_AllCountriesOfContinent = KQL_AllCountriesOfContinentStore();
