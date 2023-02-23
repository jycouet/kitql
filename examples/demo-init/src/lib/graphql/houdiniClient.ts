import { browser } from '$app/environment';
import type { RequestHandlerArgs } from '$houdini';
import { HoudiniClient } from '$houdini';
import { createClient } from 'graphql-sse';

const url = '/api/graphql';

async function requestHandler({ fetch, text = '', variables = {} }: RequestHandlerArgs) {
	const result = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query: text,
			variables
		})
	});

	return await result.json();
}

let subscriptionHandler = browser
	? createClient({
			url: 'http://localhost:3777/api/graphql'
	  })
	: null;

export default new HoudiniClient(requestHandler, subscriptionHandler);
