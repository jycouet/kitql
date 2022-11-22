// export type TEnumsModuleConfig = {
//   prismaFile: string
//   enumsModuleFolder: string
// }

export type KitQLVite = {
  projectName?: string

  // outputFolder?: string
  // moduleOutputFolder?: string
  // importBaseTypesFrom?: string
  // modules?: string[]

  prismaFileForEnums?: string | false
  // createEnumsModule?: TEnumsModuleConfig | false
  //   mergeModuleTypedefs?: boolean
  //   mergeModuleResolvers?: boolean
  //   mergeContexts?: boolean
  //   mergeModules?: boolean

  /**
   * @deprecated for library development only
   */
  localDev?: boolean

  /**
   * @experimental to generate as string or gql (default to gql)
   */
  typeDefsStyle?: 'string' | 'gql'
}
