import { InMemoryCache, KitQLClient } from '@kitql/client';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const PORT = import.meta.env.VITE_PORT;

export const kitQLClient = new KitQLClient({
	url: BASE_URL + ':' + PORT + '/api/graphql',
	headersContentType: 'application/json',
	logType: ['client', 'server', 'operationAndvariables'],
	cacheImplementation: new InMemoryCache()
});
