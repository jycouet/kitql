export type TEnumsModuleConfig = {
  prismaFile: string
  enumsModuleFolder: string
}

export type KitQLVite = {
  outputFolder: string
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
