import { browser } from '$app/env';
import * as Types from "$lib/graphql/_kitql/graphqlTypes";
import { defaultStoreValue, RequestStatus, type RequestParameters, type RequestResult } from '@kitql/client';
import { writable } from 'svelte/store';
import { kitQLClient } from '../kitQLClient';
 
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
