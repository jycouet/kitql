import { useGraphQLModules } from '@envelop/graphql-modules'
import { type Module, type Provider,createApplication } from 'graphql-modules'
import type { MiddlewareMap } from 'graphql-modules/shared/middleware'

import type { YogaPlugin } from '$lib'

export const useKitqlModules = (
  modules: Module[],
  middlewares?: MiddlewareMap,
  providers?: Provider<any>[] | (() => Provider<any>[]),
): YogaPlugin => {
  return useGraphQLModules(
    createApplication({
      modules,
      middlewares,
      providers,
    }),
  )
}
