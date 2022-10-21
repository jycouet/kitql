import { useGraphQLModules } from '@envelop/graphql-modules'
import { createApplication, type Module, type Provider } from 'graphql-modules'
import type { MiddlewareMap } from 'graphql-modules/shared/middleware'

export const useKitModules = (
  modules: Module[],
  middlewares?: MiddlewareMap,
  providers?: Provider<any>[] | (() => Provider<any>[])
) => {
  try {
    return useGraphQLModules(
      createApplication({
        modules,
        middlewares,
        providers,
      })
    )
  } catch (error) {
    console.error(error)
  }
}
