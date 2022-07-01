import { yogaServer } from '$graphql/server';
import type { RequestEvent } from '@sveltejs/kit/types/internal';

export async function get() {
	return {
		status: 302,
		headers: { Location: '/' }
	};
}

export async function post(event: RequestEvent) {
	return yogaServer.handleRequest(event.request);
}
