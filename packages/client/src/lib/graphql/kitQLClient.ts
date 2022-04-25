import { KitQLClient, InMemoryCache } from '@kitql/client';

//cool stuff to have it typed 🤟
export type AppHeaders = {
	Authorization?: `Bearer ${string}`;
};

export const kitQLClient = new KitQLClient<AppHeaders>({
	url: `https://countries.trevorblades.com/graphql`,
	headersContentType: 'application/json',
	logType: ['client', 'server', 'operationAndvariables'],
	cacheImplementation: new InMemoryCache()
	//cacheImplementation: new LocalStorageCache(),
	// endpointNetworkDelayMs: 3000,
	// endpointSSRDelayMs: 1000
});
