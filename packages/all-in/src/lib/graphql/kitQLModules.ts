import { useGraphQLModules } from '@envelop/graphql-modules'
import { createApplication, type Module } from 'graphql-modules'

export const kitQLModules = (modules: Module[]) =>
  useGraphQLModules(
    createApplication({
      modules,
    })
  )
