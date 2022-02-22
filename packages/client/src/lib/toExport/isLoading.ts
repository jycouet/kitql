import { RequestStatus, type RequestResult } from '@kitql/client';

// todo: move to @kitql/client
/**
 * Check if on of the stores is in loading state
 * @param stores one or more stores to check
 * @returns true if at least 1 store is in loading state
 */
export function isLoading(stores: RequestResult<any, any> | RequestResult<any, any>[]): boolean {
	if (Array.isArray(stores)) {
		return stores.some((store) => store.status === RequestStatus.LOADING);
	}
	return stores.status === RequestStatus.LOADING;
}
