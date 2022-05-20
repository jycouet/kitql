import path from 'path'
import { write } from './readWrite'

export type TConfigFile = {
  configs: {
    modulesFolder: string
    moduleOutputFolder: string
    outputFolder: string
  }
  actions: {
    createEnumsModule?: { prismaFile: string; importBaseTypesFrom: string } | false
    mergeModuleTypedefs: boolean
    mergeModuleResolvers: boolean
    mergeContexts: boolean
    mergeModules: boolean
  }
}

export function writeDefaultConfigFile(pathFile) {
  const data = [
    `configs:`,
    `  modulesFolder: ./src/lib/modules`,
    `  moduleOutputFolder: _kitql`,
    `  outputFolder: ./src/lib/graphql/_kitql`,
    ``,
    `actions:`,
    `  # - createBaseStructure: true`,
    `  createEnumsModule:`,
    `    prismaFile: ./prisma/schema.prisma`,
    `    importBaseTypesFrom: $graphql/_kitql/graphqlTypes`,
    ``,
    `  mergeModuleTypedefs: true`,
    `  mergeModuleResolvers: true`,
    `  mergeContexts: true`,
    `  mergeModules: true`,
    ``,
  ]

  write(path.join(pathFile), data)
}
