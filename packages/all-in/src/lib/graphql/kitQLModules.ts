import { useGraphQLModules } from '@envelop/graphql-modules'
import { createApplication, type Module } from 'graphql-modules'

export const kitQLModules = (modules: Module[]) => {
  try {
    return useGraphQLModules(
      createApplication({
        modules,
      })
    )
  } catch (error) {
    console.error(error)
  }
}
