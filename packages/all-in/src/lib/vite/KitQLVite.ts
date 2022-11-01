export type TEnumsModuleConfig = {
  prismaFile: string
  enumsModuleFolder: string
}

export type KitQLVite = {
  projectName?: string

  // outputFolder?: string
  // moduleOutputFolder?: string
  // importBaseTypesFrom?: string
  // modules?: string[]

  createEnumsModule?: TEnumsModuleConfig | false
  //   mergeModuleTypedefs?: boolean
  //   mergeModuleResolvers?: boolean
  //   mergeContexts?: boolean
  //   mergeModules?: boolean

  /**
   * @deprecated for library development only
   */
  localDev?: boolean
}
