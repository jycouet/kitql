import { Log, logCyan, logGreen, logRed, logYellow, sleep, stry } from '@kitql/helper';
//import { print } from 'graphql';
//https://github.com/graphql/graphql-js/pull/3501
import { print } from 'graphql-web-lite';
import type { ICacheData } from './cache/ICacheData';
import { InMemoryCache } from './cache/InMemoryCache';

export type ClientSettings = {
	/**
	 * url of your graphql endpoint.
	 */
	url: string;
	/**
	 * Headers of your requests to graphql endpoint
	 * @name headers
	 * @default {}
	 */
	headers?: Record<string, string>;
	/**
	 * Default Cache in miliseconds
	 * @default 3 Minutes (1000 * 60 * 3)
	 */
	cacheMs?: number;
	/**
	 * @default cache-first
	 */
	policy?: Policy;
	/**
	 * More info there: https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
	 * @Default omit Secure by default.
	 */
	credentials?: Credential;
	/**
	 * @Default to `/graphql+json`. But if your server is a bit legacy, you can go back to `/json`
	 */
	headersContentType?: HeaderContentType;
	/**
	 * @Default [] That means no logs!.
	 */
	logType?: LogType[];
	/**
	 * @Default InMemory that mean a cache in a variable
	 * @description You can provide any implementation of the CacheData interface, it can store the cache in any place
	 */
	cacheImplementation?: ICacheData;
	/**
	 * @default 0
	 * @description endpoint delay in miliseconds. Usefull to simulate slow network by configuration.
	 */
	endpointNetworkDelayMs?: number;
	/**
	 * @default 0
	 * @description endpoint delay in miliseconds. Usefull to simulate slow ssr by configuration.
	 */
	endpointSSRDelayMs?: number;
};

export type RequestSettings = {
	/**
	 * Cache in miliseconds for the Query (so `cache:0` force a network call)
	 */
	cacheMs?: number;
	/**
	 * overwrite the default cache policy
	 */
	policy?: Policy;
};

export type Policy = 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only';
export type Credential = 'omit' | 'same-origin' | 'include';
export type HeaderContentType = 'application/graphql+json' | 'application/json';
export type LogType = 'server' | 'client' | 'operation' | 'operationAndvariables' | 'rawResult';
export type PatchType = 'store-only' | 'cache-only' | 'cache-and-store';

export declare type RequestParameters<V> = {
	fetch?: typeof fetch;
	variables?: V;
};

export declare type RequestQueryParameters<V> = {
	settings?: RequestSettings;
} & RequestParameters<V>;

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
	operationName: string;
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
	operationName: '???',
	variables: null,
	data: null,
	errors: null,
	from: RequestFrom.NODATA,
	isOutdated: false
};

export class KitQLClient {
	private url: string;
	public policy: Policy;
	private headers: Record<string, string>;
	private cacheMs: number;
	private credentials: Credential;
	private headersContentType: HeaderContentType;
	private logType: LogType[];
	private cacheData: ICacheData;
	private log: Log;
	private endpointNetworkDelayMs: number;
	private endpointSSRDelayMs: number;

	constructor(options: ClientSettings) {
		const {
			url,
			cacheMs,
			credentials,
			headers,
			policy,
			headersContentType,
			endpointNetworkDelayMs,
			endpointSSRDelayMs
		} = options ?? {};
		this.url = url;
		this.policy = policy ?? 'cache-first';
		this.headers = headers ?? {};
		this.cacheMs = cacheMs ?? 1000 * 60 * 3;
		this.credentials = credentials;
		this.headersContentType = headersContentType ?? 'application/graphql+json';
		this.logType = options.logType ?? [];
		this.cacheData = options.cacheImplementation ?? new InMemoryCache();
		this.endpointNetworkDelayMs = endpointNetworkDelayMs ?? 0;
		this.endpointSSRDelayMs = endpointSSRDelayMs ?? 0;

		this.log = new Log('KitQL Client');
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
		operationName,
		cacheMs,
		browser
	}: {
		variables: any;
		operationName: string;
		cacheMs: number | null;
		browser: boolean;
	}): ResponseResult<D, V> | null {
		const logStatements = this.getLogsStatements(browser);

		// No caching in the server for now! (Need to have a session identification to not mix things up)
		if (browser) {
			const cachedData = this.cacheData.get<D, V>(operationName, variables);
			if (cachedData !== undefined) {
				const xMs = new Date().getTime() - cachedData.date;
				// cache time of the query or of the default config
				if (xMs < (cacheMs ?? this.cacheMs)) {
					if (logStatements.logOpVar) {
						this.logOperation(RequestFrom.CACHE, operationName, stry(variables, 0));
					} else if (logStatements.logOp) {
						this.logOperation(RequestFrom.CACHE, operationName);
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
		operationName,
		browser
	}): Promise<ResponseResult<D, V>> {
		const logStatements = this.getLogsStatements(browser);

		// User help, he is doing wrong
		if (!browser && !skFetch) {
			this.log.error(
				`I think that either:` +
					`\n\t${logRed(`1/`)} you forgot to provide \`${logYellow(
						`fetch`
					)}\`! As we are in SSR here. ` +
					`\n\t   It should be something like:` +
					`\n` +
					`\n\t<script context="module" lang="ts">` +
					`\n\t  export async function load({ ${logYellow(`fetch`)} }) {` +
					`\n\t    ${logYellow('await')} ${logCyan(operationName)}.queryLoad({ ${logYellow(
						`fetch`
					)}, variables: { ... } });` +
					`\n\t    return {};` +
					`\n\t  }` +
					`\n\t</script>` +
					`\n` +
					`\n\t${logRed(`2/`)} you should run this in a browser only.`
			);
		}
		const fetchToUse = skFetch ? skFetch : fetch;

		let dataToReturn: ResponseResult<D, V> = {
			date: new Date().getTime(),
			operationName,
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
				await sleep(this.endpointSSRDelayMs); // adding the delay after the request
			} else {
				await sleep(this.endpointNetworkDelayMs); // adding the delay after the request
			}

			if (logStatements.logOpVar) {
				this.logOperation(dataToReturn.from, operationName, stry(variables, 0));
			} else if (logStatements.logOp) {
				this.logOperation(dataToReturn.from, operationName);
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
				this.cacheData.set(operationName, dataToReturn);
			}

			return dataToReturn;
		} catch (errors) {
			dataToReturn.errors = [errors];
			return dataToReturn;
		}
	}

	public cacheRemove(
		operationKey: string,
		params?: { variables?: {} | null; allOperationKey?: boolean | null } | null
	) {
		const nbDeleted = this.cacheData.remove(operationKey, params.variables, params.allOperationKey);

		this.logInfo(operationKey, 'ResetCache', nbDeleted.toString());

		return nbDeleted;
	}

	public logInfo(operationName: string, key: string, value: string) {
		const browserAndWantLog = this.logType.includes('client');
		if (browserAndWantLog) {
			this.log.info(
				`${logCyan(`${key}:`)} ${logGreen(value)}, ` +
					`${logCyan('Operation:')} ${logGreen(operationName)}`
			);
		}
	}

	public cacheUpdate<D, V>(
		operationKey: string,
		data: D,
		params?: { variables?: V | null } | null
	): RequestResult<D, V> | undefined {
		const dataCached = this.cacheData.get(operationKey, params.variables);
		if (dataCached) {
			let toReturn = { ...dataCached, data, variables: params.variables } as RequestResult<D, V>;
			this.cacheData.set(operationKey, toReturn);
			return toReturn;
		}
		return undefined;
	}
}
