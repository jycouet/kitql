import { Log, logGreen, logRed } from '@kitql/helper'
import { basename, extname, join } from 'path'
import { actionContext } from './actionContexts'
import { actionEnum } from './actionEnum'
import { actionModules } from './actionModules'
import { actionResolvers } from './actionResolvers'
import { actionTypeDefs } from './actionTypeDefs'
import { getDirectories, getFiles, getFullPath } from './fileFolder'
import { toPascalCase } from './formatString'
import { type KitQLVite } from './KitQLVite'
import { getPrismaEnum } from './prismaHelper'
import { readLines } from './readWrite'

export function generate(config?: KitQLVite) {
  const log = new Log('KitQL module-codegen')

  const providersFolder = 'providers' as const

  const { outputFolder, moduleOutputFolder, importBaseTypesFrom, modules } = {
    outputFolder: '',
    moduleOutputFolder: '',
    importBaseTypesFrom: '',
    modules: [],
    ...config,
  }
  const { mergeModuleTypedefs, mergeModuleResolvers, mergeContexts, mergeModules } = {
    mergeModuleTypedefs: '',
    mergeModuleResolvers: '',
    mergeContexts: '',
    mergeModules: '',
    ...config?.actions,
  }

  const meta = {
    enums: 0,
    modules: 0,
    typedefs: 0,
    resolvers: 0,
  }

  // Enums
  if (config.actions.createEnumsModule) {
    const { prismaFile, enumsModuleFolder } = {
      prismaFile: '',
      enumsModuleFolder: '',
      ...config.actions.createEnumsModule,
    }

    const prismaFilePath = getFullPath(prismaFile)
    if (readLines(prismaFilePath).length === 0) {
      const enums = getPrismaEnum(readLines(prismaFilePath))
      const enumsKeys = actionEnum(enumsModuleFolder, moduleOutputFolder, importBaseTypesFrom, enums)
      meta.enums = enumsKeys.length
    } else {
      log.error(`${'❌'} file ${logRed(prismaFilePath)} not found!`)
      throw new Error(`file ${prismaFilePath} not found!`)
    }
  }

  // Typedefs && Resolvers
  const mergeModuleAction = []
  if (mergeModuleTypedefs) {
    mergeModuleAction.push('Typedefs')
  }
  if (mergeModuleResolvers) {
    mergeModuleAction.push('Resolvers')
  }
  if (mergeContexts) {
    mergeModuleAction.push('Contexts')
  }

  const contexts: { moduleName: string; ctxName: string }[] = []
  const modulesObj: { name: string; directory: string }[] = []
  modules.forEach((source: string) => {
    const directories = getDirectories(source)
    directories.forEach(directory => {
      const moduleName = basename(directory, extname(directory))

      let typedefsFilesLength = 0
      let resolversFilesLength = 0

      // TypeDefs
      if (mergeModuleTypedefs) {
        typedefsFilesLength = actionTypeDefs(directory, moduleOutputFolder)
      }

      // Resolvers
      if (mergeModuleResolvers) {
        resolversFilesLength = actionResolvers(directory, moduleOutputFolder)
      }

      // Contexts
      // if (mergeContexts) {
      //   const dataloadersModule: { moduleName: string; providerFile: string }[] = []
      //   const providersFiles = getFiles(join(directory, providersFolder))
      //   let withDbProvider = false
      //   providersFiles.forEach(providerFile => {
      //     if (providerFile.startsWith(`dl${toPascalCase(moduleName)}`)) {
      //       dataloadersModule.push({ moduleName, providerFile })
      //     }
      //     if (providerFile.startsWith(`Db${toPascalCase(moduleName)}`)) {
      //       withDbProvider = true
      //     }
      //   })

      //   providersFiles.forEach(providerFile => {
      //     if (providerFile.startsWith('_ctx')) {
      //       const ctxName = providerFile.replace('_ctx', '').replace('.ts', '')
      //       contexts.push({ moduleName, ctxName })
      //     }
      //   })
      // }

      if (mergeModuleAction.length > 0) {
        meta.typedefs += typedefsFilesLength
        meta.resolvers += resolversFilesLength
      }

      modulesObj.push({ directory, name: moduleName })
    })
  })

  // mergeContexts
  if (mergeContexts) {
    actionContext(contexts, outputFolder)
  }

  // mergeModules
  if (mergeModules) {
    actionModules(modulesObj, outputFolder)
    meta.modules = modulesObj.length
  }

  // Done
  log.info(
    `${logGreen('✔')} success ` +
      `[${logGreen('' + meta.modules)} modules, ` +
      `${logGreen('' + meta.enums)} enums, ` +
      `${logGreen('' + meta.typedefs)} typedefs, ` +
      `${logGreen('' + meta.resolvers)} resolvers]`
  )
}
