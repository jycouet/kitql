export type TEnumsModuleConfig = {
  prismaFile: string
  enumsModuleFolder: string
}

export type KitQLVite = {
  projectName?: string

  outputFolder?: string
  moduleOutputFolder?: string
  importBaseTypesFrom?: string
  modules?: string[]
  actions?: {
    createEnumsModule?: TEnumsModuleConfig | false
    mergeModuleTypedefs?: boolean
    mergeModuleResolvers?: boolean
    mergeContexts?: boolean
    mergeModules?: boolean
  }
}
