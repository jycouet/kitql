import type { YogaPlugin } from '$lib'
import { useGraphQLModules } from '@envelop/graphql-modules'
import { createApplication, type Module, type Provider } from 'graphql-modules'
import type { MiddlewareMap } from 'graphql-modules/shared/middleware'

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
