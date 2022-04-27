import { KitQLClient, InMemoryCache } from '@kitql/client';

class KitFeedbackClient extends KitQLClient<{ Authorization: string }> {
	constructor() {
		super({
			url: 'https://api.github.com/graphql',
			headersContentType: 'application/json',
			logType: ['client', 'server', 'operationAndvariables'],
			cacheImplementation: new InMemoryCache()
		});
	}

	public initialize = (props: { token: string }) => {
		console.log('KitFeedbackClient initialize');
		this.setHeaders({
			Authorization: `Bearer ${props.token}`
		});
	};
}

export let kitQLClient = new KitFeedbackClient();
