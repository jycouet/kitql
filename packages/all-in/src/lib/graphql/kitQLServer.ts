import type { KitQLCreateServerOptions } from '$lib/hooks/graphql'
import type { RequestEvent } from '@sveltejs/kit'
import { createServer } from './createServer'
import { kitQLModules } from './kitQLModules'
// This should be fully generated 🥳
import { modules } from './_kitql/_appModules'

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
  const user = { id: 1, name: 'John' }

  return {
    request,
    user,
  }
}

const plugins = []
plugins.push(kitQLModules(modules))

export const kitqlServer = (options?: KitQLCreateServerOptions) => {
  const { endpoint } = {
    endpoint: '/graphql',
    ...options,
  }

  return createServer<IKitQLContext>({
    context: getContext,
    plugins,
    graphqlEndpoint: endpoint,
    fetchAPI: globalThis,
  })
}
