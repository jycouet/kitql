import { yogaServer } from '$graphql/server';
import type { RequestEvent } from '@sveltejs/kit/types/internal';

export async function GET() {
	return {
		status: 302,
		headers: { Location: '/' }
	};
}

export async function POST(event: RequestEvent) {
	return yogaServer.handleRequest(event.request);
}
