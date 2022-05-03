import { InMemoryCache, KitQLClient } from '@kitql/client';

type KitFeedbackHeaders = { Authorization: string };

const GITHUB_API_TOKEN = import.meta.env.VITE_GITHUB_API_TOKEN;

export const kitQLClient = new KitQLClient<KitFeedbackHeaders>({
	url: 'https://api.github.com/graphql',
	headersContentType: 'application/json',
	logType: ['client', 'server', 'operationAndvariables'],
	cacheImplementation: new InMemoryCache(),
	headers: {
		Authorization: `Bearer ${GITHUB_API_TOKEN}`
	}
});
