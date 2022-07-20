import type { RequestHandlerArgs } from '$houdini';
import { HoudiniClient } from '$houdini';

async function fetchQuery({
	fetch,
	text = '',
	variables = {},
	session,
	metadata
}: RequestHandlerArgs) {
	const url = import.meta.env.VITE_GRAPHQL_ENDPOINT;

	if (!url) {
		throw new Error('Did you create `.env` from `.env.example`? 😅');
	}

	const result = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
		},
		body: JSON.stringify({
			query: text,
			variables
		})
	});

	return await result.json();
}

export const houdiniClient = new HoudiniClient(fetchQuery);
