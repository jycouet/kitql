import { KitQLClient } from '@kitql/client';

export const kitQLClient = new KitQLClient({
	url: `https://countries.trevorblades.com/graphql`,
	headersContentType: 'application/json',
	logType: ['client', 'server', 'operationAndvariables']
});
