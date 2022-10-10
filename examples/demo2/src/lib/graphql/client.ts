import type { RequestHandlerArgs } from '$houdini';
import { HoudiniClient } from '$houdini';

async function fetchQuery({
	fetch,
	text = '',
	variables = {},
	session,
	metadata
}: RequestHandlerArgs) {
	const url = '/api/graphql';

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

export default new HoudiniClient(fetchQuery);
