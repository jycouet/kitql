import { browser } from '$app/env';
import * as Types from "$lib/graphql/_kitql/graphqlTypes";
import { defaultStoreValue, RequestStatus, type RequestParameters, type RequestResult } from '@kitql/client';
import { get, writable } from 'svelte/store';
import { kitQLClient } from '../kitQLClient';
 
/**
 * KitQL Svelte Store with the latest `AllContinentsQuery` Operation
 */
export const AllContinentsQueryStore = writable<RequestResult<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>>(defaultStoreValue);

/**
 * For SSR, you need to provide 'fetch' from the load function
 * For the client you can avoid to provide the 'fetch' native function
 * @param params
 * @returns the latest AllContinentsQuery operation and fill the AllContinentsQueryStore
 */
// prettier-ignore
export async function AllContinentsQuery(
  params?: RequestParameters<Types.AllContinentsQueryVariables>
): Promise<RequestResult<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>> {

  let storedVariables = null;
	AllContinentsQueryStore.update((c) => {
		storedVariables = c.variables;
		return { ...c, status: RequestStatus.LOADING };
	});
	let { fetch, variables, settings } = params ?? {};
  let { cache } = settings ?? {};

  if (variables === undefined) {
    variables = storedVariables;
  }
	const res = await kitQLClient.request<Types.AllContinentsQuery, Types.AllContinentsQueryVariables>({
		document: Types.AllContinentsDocument,
		variables,
		skFetch: fetch,
		cacheKey: "AllContinentsQuery",
		cache,
		browser
	});
	const result = { status: RequestStatus.DONE, ...res, variables };
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
export const AllCountriesOfContinentQueryStore = writable<RequestResult<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>>(defaultStoreValue);

/**
 * For SSR, you need to provide 'fetch' from the load function
 * For the client you can avoid to provide the 'fetch' native function
 * @param params
 * @returns the latest AllCountriesOfContinentQuery operation and fill the AllCountriesOfContinentQueryStore
 */
// prettier-ignore
export async function AllCountriesOfContinentQuery(
  params?: RequestParameters<Types.AllCountriesOfContinentQueryVariables>
): Promise<RequestResult<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>> {

  let storedVariables = null;
	AllCountriesOfContinentQueryStore.update((c) => {
		storedVariables = c.variables;
		return { ...c, status: RequestStatus.LOADING };
	});
	let { fetch, variables, settings } = params ?? {};
  let { cache } = settings ?? {};

  if (variables === undefined) {
    variables = storedVariables;
  }
	const res = await kitQLClient.request<Types.AllCountriesOfContinentQuery, Types.AllCountriesOfContinentQueryVariables>({
		document: Types.AllCountriesOfContinentDocument,
		variables,
		skFetch: fetch,
		cacheKey: "AllCountriesOfContinentQuery",
		cache,
		browser
	});
	const result = { status: RequestStatus.DONE, ...res, variables };
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
