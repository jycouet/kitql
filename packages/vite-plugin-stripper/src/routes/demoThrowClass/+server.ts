import type { RequestHandler } from './$types.js'

export const GET: RequestHandler = async () => {
	throw new Error('Not implemented')
	// oxlint-disable-next-line no-unreachable
	return new Response()
}
