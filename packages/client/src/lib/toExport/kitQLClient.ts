import { Log, logCyan, logGreen, logYellow } from '@kitql/helper';
import { print } from 'graphql';
import { stringify } from 'safe-stable-stringify';
import { CacheData } from './CacheData';
import { objUpdate } from './objUpdate';

export type ClientSettings = {
	/**
	 * url of your graphql endpoint.
	 */
	url: string;
	/**
	 * @name headers
	 * @description Headers of your requests to graphql endpoint
	 * @default {}
	 */
	headers?: Record<string, string>;
	/**
	 * Default Cache in miliseconds (can be overwritten at Query level, so `cache:0` force a network call)
	 */
	defaultCache?: number;
	/**
	 * Default to `omit` (secure by default). More info there: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
	 */
	credentials?: 'omit' | 'same-origin' | 'include';
	/**
	 * Default to `/graphql+json`. But if your server is a bit legacy, you can go back to `/json`
	 */
	headersContentType?: 'application/graphql+json' | 'application/json';
	/**
	 * Default to `[]` => no logs!.
	 */
	logType?: ('server' | 'client' | 'operation' | 'operationAndvariables' | 'rawResult')[];
};

export type RequestSettings = {
	/**
	 * Cache in miliseconds for the Query (so `cache:0` force a network call)
	 */
	cache: number;
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
	'SSR' = 'SSR',
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
	private headers: Record<string, string>;
	private cache: number;
	private credentials: 'omit' | 'same-origin' | 'include';
	private headersContentType: 'application/graphql+json' | 'application/json';
	private logType: ('server' | 'client' | 'operation' | 'operationAndvariables' | 'rawResult')[];

	private cacheData: CacheData;
	private log: Log;

	constructor(options: ClientSettings) {
		const { url, defaultCache, credentials, headers } = options ?? {};
		this.url = url;
		this.headers = headers ?? {};
		this.cache = defaultCache ?? 1000 * 60 * 3;
		this.credentials = credentials;
		this.headersContentType = options.headersContentType ?? 'application/graphql+json';
		this.logType = options.logType ?? [];
		this.log = new Log('KitQL Client');
		this.cacheData = new CacheData();
	}

	private logOperation(
		browser: boolean,
		from: RequestFrom,
		operation: string,
		variables: string | null = null
	) {
		this.log.info(
			// `${logCyan('Mode:')} ` +
			// 	`${logGreen(browser ? 'browser' : 'server')}, ` +
			`${logCyan('From:')} ${logGreen(from)}, ${new Array(7 - from.length + 1).join(' ')}` +
				`${logCyan('Operation:')} ${logGreen(operation)}` +
				`${variables ? `, ${logCyan('Variables:')} ${logGreen(variables)}` : ``}`
		);
	}

	public async request<D, V>({
		skFetch,
		document,
		variables,
		cacheKey,
		cache,
		browser
	}): Promise<ResponseResult<D, V>> {
		// Logging variables
		const browserAndWantLog = browser && this.logType.includes('client');
		const serverAndWantLog = !browser && this.logType.includes('server');
		const logOp = this.logType.includes('operation') && (browserAndWantLog ?? serverAndWantLog);
		const logOpVar =
			this.logType.includes('operationAndvariables') && (browserAndWantLog ?? serverAndWantLog);
		const logRawResult =
			this.logType.includes('rawResult') && (browserAndWantLog ?? serverAndWantLog);

		// No caching in the server for now! (Need to have a session identification to not mix things up)
		if (browser) {
			// Check the cache
			if (cache !== 0) {
				const cachedData = this.cacheData.get(cacheKey, variables);
				if (cachedData !== undefined) {
					const xMs = new Date().getTime() - cachedData.date;
					// cache time of the query or of the default config
					if (xMs < (cache ?? this.cache)) {
						if (logOpVar) {
							this.logOperation(browser, RequestFrom.CACHE, cacheKey, stringify(variables));
						} else if (logOp) {
							this.logOperation(browser, RequestFrom.CACHE, cacheKey);
						}
						return { ...cachedData, from: RequestFrom.CACHE };
					} else {
						// remove from cache? No need, it will be overwritten anyway!
					}
				}
			}
		}

		// If
		//   1/ we are in SSR
		//   2/ we don't provide a fetch function
		//      => You are probably doing something wrong!
		if (!browser && !skFetch) {
			this.log.error(
				`I think that either:` +
					`\n\t\t1/ you forgot to provide \`fetch\`! As we are in SSR & include here. > ${cacheKey}({ fetch: ??? })` +
					`\n\t\t2/ you should run this in a browser only.`
			);
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
				headers: { ...this.headers, 'Content-Type': this.headersContentType },
				body: JSON.stringify({
					query: print(document),
					variables
				})
			});

			if (res.url === '') {
				// In the browser we see a flickering from NETWORK to SSR, because it's the Real SSR coming with a from network... Replaced by the SSR side!
				dateToReturn.from = RequestFrom.SSR;
			}
			if (logOpVar) {
				this.logOperation(browser, dateToReturn.from, cacheKey, stringify(variables));
			} else if (logOp) {
				this.logOperation(browser, dateToReturn.from, cacheKey);
			}

			if (res.status !== 200) {
				if (res.statusText === '') {
					dateToReturn.errors = [new Error(`${res.status} - ${await res.text()}`)];
				} else {
					dateToReturn.errors = [new Error(`${res.status} - ${res.statusText}`)];
				}
				return dateToReturn;
			}

			let dataJson = await res.json();

			if (logRawResult) {
				this.log.info(`${logCyan('dataJson:')} ` + `${stringify(dataJson)}`);
			}
			if (dataJson.errors) {
				dateToReturn.errors = dataJson.errors;
				return dateToReturn;
			}

			dateToReturn.data = dataJson.data;
			// No caching in the server for now! (Need to have a session identification to not mix things up)
			if (browser) {
				this.cacheData.set(cacheKey, dateToReturn);
			}

			return dateToReturn;
		} catch (errors) {
			dateToReturn.errors = errors;
			return dateToReturn;
		}
	}

	public cacheRemove(
		operationKey: string,
		params?: { variables?: {} | null; allOperationKey?: boolean | null } | null
	) {
		const nbDeleted = this.cacheData.remove(operationKey, params.variables, params.allOperationKey);

		const browserAndWantLog = this.logType.includes('client');
		if (browserAndWantLog) {
			this.log.info(
				`${logCyan('ResetCache:')} ${logGreen(nbDeleted.toString())}, ` +
					`${logCyan('Operation:')} ${logGreen(operationKey)}`
			);
		}
	}

	// typing for xPath
	public storeUpdate<D, V>(
		operationKey: string,
		store: RequestResult<D, V>,
		newData: Object, // To be fragments only?
		xPath: string | null = null,
		id: string | number | null = null
	): RequestResult<D, V> {
		// remove all from the cache, we will update only the current store
		// Can be improved later ;) => Updating all cached data (with option? Perf?)
		this.cacheData.remove(operationKey, null, true);

		let storeDataUpdated = objUpdate(false, store.data, newData, xPath, id);
		const browserAndWantLog = this.logType.includes('client');
		if (!storeDataUpdated.found) {
			if (browserAndWantLog) {
				this.log.info(
					`${logCyan('StoreUpdate:')} xPath ${logGreen(xPath)}(${logGreen(id + '')}) ` +
						`${logYellow('not found')}, ` +
						`${logCyan('Store:')} ${logGreen(operationKey + 'Store')}`
				);
			}
		} else {
			this.cacheData.set(operationKey, store);
			if (browserAndWantLog) {
				this.log.info(
					`${logCyan('StoreUpdate:')} ${logGreen('1')}, ` +
						`${logCyan('Store:')} ${logGreen(operationKey + 'Store')}`
				);
			}
		}
		return { ...store, data: storeDataUpdated.obj } as RequestResult<D, V>;
	}
}
