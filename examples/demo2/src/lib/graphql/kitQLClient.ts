import { KitQLClient } from '@kitql/client';

export const kitQLClient = new KitQLClient({
	url: `/api/graphql`,
	headersContentType: 'application/json',
	logType: ['client', 'server', 'operationAndvariables']
});
