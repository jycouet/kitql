import { Log, logCyan, logGreen, logYellow, stry } from '@kitql/helper';
//import { print } from 'graphql';
//https://github.com/graphql/graphql-js/pull/3501
import { print } from 'graphql-web-lite';
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
	 * @default 3_Minutes Default Cache in miliseconds (can be overwritten at Query level, so `cache:0` force a network call)
	 */
	defaultCache?: number;
	/**
	 * @default cache-first
	 */
	defaultPolicy?: 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only';
	/**
	 * @Default omit Secure by default. More info there: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
	 */
	credentials?: 'omit' | 'same-origin' | 'include';
	/**
	 * Default to `/graphql+json`. But if your server is a bit legacy, you can go back to `/json`
	 */
	headersContentType?: 'application/graphql+json' | 'application/json';
	/**
	 * @Default [] That means no logs!.
	 */
	logType?: ('server' | 'client' | 'operation' | 'operationAndvariables' | 'rawResult')[];
};

export type RequestSettings = {
	/**
	 * Cache in miliseconds for the Query (so `cache:0` force a network call)
	 */
	cache?: number;
	/**
	 * overwrite the default cache policy
	 */
	policy?: 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only';
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
	isOutdated: boolean;
};

export declare type RequestResult<D, V> = {
	status: RequestStatus;
	isFetching: boolean;
} & ResponseResult<D, V>;

export const defaultStoreValue = {
	status: RequestStatus.NEVER,
	isFetching: false,
	date: new Date().getTime(),
	variables: null,
	data: null,
	errors: null,
	from: RequestFrom.NODATA,
	isOutdated: false
};

export class KitQLClient {
	public defaultPolicy: 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only';

	private url: string;
	private headers: Record<string, string>;
	private defaultCache: number;
	private credentials: 'omit' | 'same-origin' | 'include';
	private headersContentType: 'application/graphql+json' | 'application/json';
	private logType: ('server' | 'client' | 'operation' | 'operationAndvariables' | 'rawResult')[];

	private cacheData: CacheData;
	private log: Log;

	constructor(options: ClientSettings) {
		const { url, defaultCache, credentials, headers, defaultPolicy } = options ?? {};
		this.defaultPolicy = defaultPolicy ?? 'cache-first';
		this.url = url;
		this.headers = headers ?? {};
		this.defaultCache = defaultCache ?? 1000 * 60 * 3;
		this.credentials = credentials;
		this.headersContentType = options.headersContentType ?? 'application/graphql+json';
		this.logType = options.logType ?? [];
		this.log = new Log('KitQL Client');
		this.cacheData = new CacheData();
	}

	private logOperation(from: RequestFrom, operation: string, variables: string | null = null) {
		this.log.info(
			// `${logCyan('Mode:')} ` +
			// 	`${logGreen(browser ? 'browser' : 'server')}, ` +
			`${logCyan('From:')} ${logGreen(from)}, ${new Array(7 - from.length + 1).join(' ')}` +
				`${logCyan('Operation:')} ${logGreen(operation)}` +
				`${variables ? `, ${logCyan('Variables:')} ${logGreen(variables)}` : ``}`
		);
	}

	private getLogsStatements(browser: boolean) {
		const browserAndWantLog = browser && this.logType.includes('client');
		const serverAndWantLog = !browser && this.logType.includes('server');

		const logOp = this.logType.includes('operation') && (browserAndWantLog ?? serverAndWantLog);
		const logOpVar =
			this.logType.includes('operationAndvariables') && (browserAndWantLog ?? serverAndWantLog);
		const logRawResult =
			this.logType.includes('rawResult') && (browserAndWantLog ?? serverAndWantLog);

		return { logOp, logOpVar, logRawResult };
	}

	public requestCache<D, V>({
		variables,
		cacheKey,
		cache,
		browser
	}: {
		variables: any;
		cacheKey: string;
		cache: number | null;
		browser: boolean;
	}): ResponseResult<D, V> | null {
		const logStatements = this.getLogsStatements(browser);

		// No caching in the server for now! (Need to have a session identification to not mix things up)
		if (browser) {
			const cachedData = this.cacheData.get(cacheKey, variables);
			if (cachedData !== undefined) {
				const xMs = new Date().getTime() - cachedData.date;
				// cache time of the query or of the default config
				if (xMs < (cache ?? this.defaultCache)) {
					if (logStatements.logOpVar) {
						this.logOperation(RequestFrom.CACHE, cacheKey, stry(variables, 0));
					} else if (logStatements.logOp) {
						this.logOperation(RequestFrom.CACHE, cacheKey);
					}
					return { ...cachedData, from: RequestFrom.CACHE, isOutdated: false };
				} else {
					return { ...cachedData, from: RequestFrom.CACHE, isOutdated: true };
				}
			}
		}

		return null;
	}

	public async request<D, V>({
		skFetch,
		document,
		variables,
		cacheKey,
		browser
	}): Promise<ResponseResult<D, V>> {
		const logStatements = this.getLogsStatements(browser);

		// User help, he is doing wrong
		if (!browser && !skFetch) {
			this.log.error(
				`I think that either:` +
					`\n\t\t1/ you forgot to provide \`fetch\`! As we are in SSR & include here. > ${cacheKey}({ fetch: ??? })` +
					`\n\t\t2/ you should run this in a browser only.`
			);
		}
		const fetchToUse = skFetch ? skFetch : fetch;

		let dataToReturn: ResponseResult<D, V> = {
			date: new Date().getTime(),
			variables,
			from: RequestFrom.NETWORK,
			data: null,
			errors: null,
			isOutdated: false
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
				dataToReturn.from = RequestFrom.SSR;
			}
			if (logStatements.logOpVar) {
				this.logOperation(dataToReturn.from, cacheKey, stry(variables, 0));
			} else if (logStatements.logOp) {
				this.logOperation(dataToReturn.from, cacheKey);
			}

			if (res.status !== 200) {
				if (res.statusText === '') {
					dataToReturn.errors = [new Error(`${res.status} - ${await res.text()}`)];
				} else {
					dataToReturn.errors = [new Error(`${res.status} - ${res.statusText}`)];
				}
				return dataToReturn;
			}

			let dataJson = await res.json();

			if (logStatements.logRawResult) {
				this.log.info(`${logCyan('dataJson:')} ` + `${stry(dataJson, 0)}`);
			}
			if (dataJson.errors) {
				dataToReturn.errors = dataJson.errors;
				return dataToReturn;
			}

			dataToReturn.data = dataJson.data;
			// No caching in the server for now! (Need to have a session identification to not mix things up)
			if (browser) {
				this.cacheData.set(cacheKey, dataToReturn);
			}

			return dataToReturn;
		} catch (errors) {
			dataToReturn.errors = errors;
			return dataToReturn;
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

		return nbDeleted;
	}

	public patch<D, V>(
		operationKey: string,
		store: RequestResult<D, V>,
		newData: Object | null, // To be fragments only?
		xPath: string | null = null
	): RequestResult<D, V> {
		// remove all from the cache, we will update only the current store
		// Can be improved later ;) => Updating all cached data (with option? Perf?)
		this.cacheData.remove(operationKey, null, true);

		let storeDataUpdated = objUpdate(false, store.data, newData, xPath);
		const browserAndWantLog = this.logType.includes('client');
		if (!storeDataUpdated.found) {
			if (browserAndWantLog) {
				this.log.info(
					`${logCyan('StoreUpdate:')} xPath ${logGreen(xPath)} ` +
						`${logYellow('not found')}, ` +
						`${logCyan('Store:')} ${logGreen(operationKey)}`
				);
			}
		} else {
			this.cacheData.set(operationKey, store);
			if (browserAndWantLog) {
				this.log.info(
					`${logCyan('StoreUpdate:')} ${logGreen('1')}, ` +
						`${logCyan('Store:')} ${logGreen(operationKey)}`
				);
			}
		}
		return { ...store, data: storeDataUpdated.obj } as RequestResult<D, V>;
	}
}
