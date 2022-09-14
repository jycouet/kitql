import { createServer } from '@graphql-yoga/common'
import type { RequestEvent } from '@sveltejs/kit'
// import type { Application } from 'graphql-modules'

// export type IKitQLContext ables to use it in code gen, and have resolvers fully typed!
// config:
//   contextType: $graphql/kitQLServer#IKitQLContext
// export type IKitQLContext = ReturnType<typeof getContext>
export type IKitQLContext = {
  request: Request
  user?: {
    id: number
    name: string
  }
}

function getContext({ request }: RequestEvent) {
  // get the cookie or the token
  const coolInfo = request.headers.get('Authorization')

  // get the user from the coolInfo (redis or db)
  let user = { id: 1, name: 'John' }

  return {
    request,
    user,
  }
}

export const kitqlServer = createServer<IKitQLContext>({
  context: getContext,
})
