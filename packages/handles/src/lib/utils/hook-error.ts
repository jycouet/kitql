import { json, text } from '@sveltejs/kit'

/**
 * Construct and return an appropriate error response. For use in hooks, since we can't use
 * sveltekit's error utilities as any thrown error triggers a 500.
 */
export function httpErrorResponse(request: Request, status: number, message: string): Response {
  if (request.headers.get('accept') === 'application/json') {
    return json({ message }, { status })
  }
  return text(message, { status })
}
