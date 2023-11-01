import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  return new Response()
}

export const POST: RequestHandler = () => {
  // do something
}
