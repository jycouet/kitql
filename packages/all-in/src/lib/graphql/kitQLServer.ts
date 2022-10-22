import type { KitQLHandleGraphQL } from '$lib/hooks/graphql'
import type { RequestEvent } from '@sveltejs/kit'

import { modules } from './$kitql/_appModules'
import { useKitqlModules } from './useKitqlModules'

const plugins = []
plugins.push(useKitqlModules(modules))

function getContext({ request }: RequestEvent) {
  // get the cookie or the token...
  const coolInfo = request.headers.get('Authorization')

  // get the user from the coolInfo (redis or db or ...)
  const user = { id: 7, name: 'JYC' }

  return {
    request,
    user,
  }
}

// Option 1 => explicitly set the context type
// export type IKitQLContext = {
//   request: Request
//   user?: {
//     id: number
//     name: string
//   }
// }
// Option 2 => build IKitQLContext from getContext return
export type IKitQLContext = ReturnType<typeof getContext>

// then, make use of "IKitQLContext" in code gen, generate resolvers fully typed!
// config:
//   contextType: $graphql/kitQLServer#IKitQLContext

export const kitqlServer: KitQLHandleGraphQL<IKitQLContext> = {
  plugins,
  context: getContext,
}
