import { browser } from '$app/env';
import * as Types from "$lib/graphql/_kitql/graphqlTypes";
import { defaultStoreValue, RequestStatus, type RequestParameters, type RequestResult } from '@kitql/client';
import { get, writable } from 'svelte/store';
import { kitQLClient } from '../kitQLClient';
 
/**
 * KitQL Svelte Store with the latest `AllContinentsQuery` Operation
 */
// prettier-ignore
export const AllContinentsQueryStore = writable<RequestResult<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>>(defaultStoreValue);

/**
 * For SSR, you need to provide 'fetch' from the load function
 * For the client you can avoid to provide the 'fetch' native function
 * @param params
 * @returns the latest AllContinentsQuery operation and fill the AllContinentsQueryStore
 */
export async function AllContinentsQuery(
	params?: RequestParameters<Types.AllContinentsQueryVariables>
): Promise<RequestResult<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>> {
	let { fetch, variables, settings } = params ?? {};
	let { cache, policy } = settings ?? {};
	const cacheKey = 'AllContinentsQuery';

	const storedVariables = get(AllContinentsQueryStore).variables;
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
				AllContinentsQueryStore.set(result);
				if (!result.isOutdated) {
					return result;
				}
			} else if (policy === 'cache-only') {
				AllContinentsQueryStore.set(result);
				return result;
			} else if (policy === 'cache-and-network') {
				AllContinentsQueryStore.set(result);
			}
		}
	}
}
	AllContinentsQueryStore.update((c) => {
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
	AllContinentsQueryStore.set(result);
	return result;
}

/**
 * KitQL Reset Cache for `AllContinentsQuery` Operation
 */
export function AllContinentsQueryCacheReset(
	variables: Types.AllContinentsQueryVariables | null = null,
	allOperationKey: boolean = true,
	withResetStore: boolean = true
) {
	kitQLClient.cacheRemove('AllContinentsQuery', { variables, allOperationKey });
	if (withResetStore) {
		AllContinentsQueryStore.set(defaultStoreValue);
	}
}

/**
 * KitQL Update `AllContinentsQueryStore` with some new data to put in xPath
 * @param xPath eg: 'post' 'contracts[].invoices[].id=$id'
 */
export function AllContinentsQueryStoreUpdate(
	newData: Object,
	xPath: string | null = null,
	id: string | number | null = null
) {
	const updatedStore = kitQLClient.storeUpdate<
		Types.AllContinentsQuery,
		Types.AllContinentsQueryVariables
	>('AllContinentsQuery', get(AllContinentsQueryStore), newData, xPath, id);
	AllContinentsQueryStore.set(updatedStore);
}

/**
 * KitQL Svelte Store with the latest `AllCountriesOfContinentQuery` Operation
 */
// prettier-ignore
export const AllCountriesOfContinentQueryStore = writable<RequestResult<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>>(defaultStoreValue);

/**
 * For SSR, you need to provide 'fetch' from the load function
 * For the client you can avoid to provide the 'fetch' native function
 * @param params
 * @returns the latest AllCountriesOfContinentQuery operation and fill the AllCountriesOfContinentQueryStore
 */
export async function AllCountriesOfContinentQuery(
	params?: RequestParameters<Types.AllCountriesOfContinentQueryVariables>
): Promise<RequestResult<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>> {
	let { fetch, variables, settings } = params ?? {};
	let { cache, policy } = settings ?? {};
	const cacheKey = 'AllCountriesOfContinentQuery';

	const storedVariables = get(AllCountriesOfContinentQueryStore).variables;
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
				AllCountriesOfContinentQueryStore.set(result);
				if (!result.isOutdated) {
					return result;
				}
			} else if (policy === 'cache-only') {
				AllCountriesOfContinentQueryStore.set(result);
				return result;
			} else if (policy === 'cache-and-network') {
				AllCountriesOfContinentQueryStore.set(result);
			}
		}
	}
}
	AllCountriesOfContinentQueryStore.update((c) => {
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
	AllCountriesOfContinentQueryStore.set(result);
	return result;
}

/**
 * KitQL Reset Cache for `AllCountriesOfContinentQuery` Operation
 */
export function AllCountriesOfContinentQueryCacheReset(
	variables: Types.AllCountriesOfContinentQueryVariables | null = null,
	allOperationKey: boolean = true,
	withResetStore: boolean = true
) {
	kitQLClient.cacheRemove('AllCountriesOfContinentQuery', { variables, allOperationKey });
	if (withResetStore) {
		AllCountriesOfContinentQueryStore.set(defaultStoreValue);
	}
}

/**
 * KitQL Update `AllCountriesOfContinentQueryStore` with some new data to put in xPath
 * @param xPath eg: 'post' 'contracts[].invoices[].id=$id'
 */
export function AllCountriesOfContinentQueryStoreUpdate(
	newData: Object,
	xPath: string | null = null,
	id: string | number | null = null
) {
	const updatedStore = kitQLClient.storeUpdate<
		Types.AllCountriesOfContinentQuery,
		Types.AllCountriesOfContinentQueryVariables
	>('AllCountriesOfContinentQuery', get(AllCountriesOfContinentQueryStore), newData, xPath, id);
	AllCountriesOfContinentQueryStore.set(updatedStore);
}
