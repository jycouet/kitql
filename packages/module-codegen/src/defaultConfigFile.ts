import path from 'path'
import { write } from './readWrite'

type TEnumsModuleConfig = {
  prismaFile: string
  enumsModuleFolder: string
}

type TGenerationConfig = {
  moduleOutputFolder: string
  importBaseTypesFrom: string
  modules: string[]
  actions: {
    createEnumsModule?: TEnumsModuleConfig | false
    mergeModuleTypedefs: boolean
    mergeModuleResolvers: boolean
    mergeContexts: boolean
    mergeModules: boolean
  }
}

export type TConfigFile = {
  generates: Record<string, TGenerationConfig>
}

export function writeDefaultConfigFile(pathFile) {
  const data = `
    generates:
      apps/firstApp/src/lib/graphql/_gen:
        modules:
          - apps/firstApp/src/lib/modules/*
          - packages/modules/*(user|cart|__init)

        actions:
          createEnumsModule:
            prismaFile: apps/firstApp/prisma/schema.prisma
            enumsModuleFolder: apps/firstApp/src/lib/modules
          mergeModuleTypedefs: true
          mergeModuleResolvers: true
          mergeContexts: true
          mergeModules: true

        moduleOutputFolder: _gen
        importBaseTypesFrom: $graphql/_gen/graphqlTypes

      apps/secondApp/src/lib/graphql/_gen:
        modules:
          - apps/secondApp/src/lib/modules/*
          - packages/modules/*(user|book|__init)
    
        actions:
          createEnumsModule:
            prismaFile: apps/secondApp/prisma/schema.prisma
            enumsModuleFolder: apps/secondApp/src/lib/modules
          mergeModuleTypedefs: true
          mergeModuleResolvers: true
          mergeContexts: true
          mergeModules: true
    
        moduleOutputFolder: _gen
        importBaseTypesFrom: $graphql/_gen/graphqlTypes
  `

  write(path.join(pathFile), data)
}
