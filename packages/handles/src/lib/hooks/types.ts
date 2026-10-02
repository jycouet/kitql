import type { RequestEvent } from '@sveltejs/kit'

// Kit 3 moved `Handle` to `@sveltejs/kit/hooks`, this shape fits both Kit 2 and 3
export type Handle = (input: {
	event: RequestEvent
	resolve: (event: RequestEvent) => Response | Promise<Response>
}) => Promise<Response>
