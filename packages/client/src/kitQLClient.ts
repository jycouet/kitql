import { print } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

export type ClientSettings = {
	/**
	 * url of your graphql endpoint.
	 */
	url: string;

	/**
	 * Default Cache in miliseconds (can be overwritten at Query level, so `cacheMs:0` force a network call)
	 */
	cacheMs?: number;
	/**
	 * Default to `omit` (secure by default). More info there: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
	 */
	credentials?: 'omit' | 'same-origin' | 'include';
	/**
	 * Default to `/graphql+json`. But if your server is a bit legacy, you can go back to `/json`
	 */
	headersContentType?: 'application/graphql+json' | 'application/json';
};

export type RequestSettings = {
	/**
	 * Cache in miliseconds for the Query (so `cacheMs:0` force a network call)
	 */
	cacheMs: number;
};

export type RequestParameters<V> = {
	fetch?: typeof fetch;
	variables?: V;
	settings?: RequestSettings;
};

export enum RequestStatus {
	'NEVER' = 'NEVER',
	'LOADING' = 'LOADING',
	'DONE' = 'DONE'
}

export enum RequestFrom {
	'NODATA' = 'NODATA',
	'NETWORK' = 'NETWORK',
	'CACHE' = 'CACHE'
}

export declare type ResponseResult<D, V> = {
	date: number;
	variables?: V;
	data?: D | null;
	errors?: Error[] | null;
	from: RequestFrom;
};

export declare type RequestResult<D, V> = {
	status: RequestStatus;
} & ResponseResult<D, V>;

export const defaultStoreValue = {
	status: RequestStatus.NEVER,
	date: new Date().getTime(),
	variables: null,
	data: null,
	errors: null,
	from: RequestFrom.NODATA
};

export class KitQLClient {
	private url: string;
	private cacheMs: number;
	private credentials: 'include' | string;
	private headersContentType: 'application/graphql+json' | 'application/json';

	private cache = {};

	constructor(options: ClientSettings) {
		const { url, cacheMs, credentials } = options || {};
		this.url = url;
		this.cacheMs = cacheMs || 1000 * 60 * 3;
		this.credentials = credentials;
		this.headersContentType = options.headersContentType || 'application/graphql+json';
	}

	public async request<D, V>({
		skFetch,
		document,
		variables,
		cacheKey,
		cacheMs
	}): Promise<ResponseResult<D, V>> {
		//Cache key... Relys on the order of the variables :s
		const key = JSON.stringify({ cacheKey, variables });

		// Check the cache
		if (cacheMs !== 0 && this.cache[key] !== undefined) {
			const xMs = new Date().getTime() - this.cache[key].date;
			// cache time of the query or od the default config
			if (xMs < (cacheMs || this.cacheMs)) {
				return { ...this.cache[key], from: RequestFrom.CACHE };
			} else {
				// remove from cache? No need, it will be overwritten anyway!
			}
		}

		const fetchToUse = skFetch ? skFetch : fetch;

		let dateToReturn: ResponseResult<D, V> = {
			date: new Date().getTime(),
			variables,
			from: RequestFrom.NETWORK,
			data: null,
			errors: null
		};
		try {
			const res = await fetchToUse(this.url, {
				method: 'POST',
				credentials: this.credentials,
				headers: { 'Content-Type': this.headersContentType },
				body: JSON.stringify({
					query: print(document),
					variables
				})
			});

			if (res.status !== 200) {
				if (res.statusText === '') {
					dateToReturn.errors = [new Error(`${res.status} - ${await res.text()}`)];
				} else {
					dateToReturn.errors = [new Error(`${res.status} - ${res.statusText}`)];
				}
				return dateToReturn;
			}

			let dataJson = await res.json();
			if (dataJson.errors) {
				dateToReturn.errors = dataJson.errors;
				return dateToReturn;
			}

			dateToReturn.data = dataJson.data;
			this.cache[key] = dateToReturn;

			return dateToReturn;
		} catch (errors) {
			dateToReturn.errors = errors;
			return dateToReturn;
		}
	}
}
