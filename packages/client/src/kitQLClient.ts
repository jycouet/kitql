import { print } from 'graphql';

export type ClientSettings = {
	url: string;
	cacheMs?: number;
	credentials?: 'include' | string;
	/**
	 * Default to `false`. But if you have a great server, put this to true! ;)
	 */
	astMode?: boolean;
};

export type RequestSettings = {
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
	date: number | null;
	variables: V;
	data: D | null;
	errors: Error[] | null;
	from: RequestFrom;
};

export declare type RequestResult<D, V> = {
	status: RequestStatus;
} & ResponseResult<D, V>;

export const defaultStoreValue = {
	status: RequestStatus.NEVER,
	date: null,
	variables: null,
	data: null,
	errors: null,
	from: RequestFrom.NODATA
};

export class KitQLClient {
	private url: string;
	private cacheMs: number;
	private credentials: 'include' | string;
	private astMode: boolean;

	private cache = {};

	constructor(options: ClientSettings) {
		const { url, cacheMs, credentials } = options || {};
		this.url = url;
		this.cacheMs = cacheMs || 1000 * 60 * 3;
		this.credentials = credentials;
		this.astMode = options.astMode || false;
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
		if (this.cache[key] !== undefined) {
			const xMs = new Date().getTime() - this.cache[key].date;
			// cache time of the query or od the default config
			if (xMs < (cacheMs || this.cacheMs)) {
				return { ...this.cache[key], from: RequestFrom.CACHE };
			} else {
				// remove from cache?
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
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query: this.astMode ? document : print(document),
					variables
				})
			});

			if (res.status !== 200) {
				dateToReturn.errors = [res.statusText];
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
