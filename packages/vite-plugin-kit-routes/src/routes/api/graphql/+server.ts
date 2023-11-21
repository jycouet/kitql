import type { RequestHandler } from './$types'

const allMethod: RequestHandler = async () => {
  return new Response()
}

export { allMethod as GET, allMethod as POST }
