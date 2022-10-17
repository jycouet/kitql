import { Log, logGreen, logRed } from '@kitql/helper'
import fs from 'fs'
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

export function generate(config: KitQLVite) {
  const log = new Log('KitQL module-codegen')

  const providersFolder = 'providers' as const

  const meta = {
    enums: 0,
    modules: 0,
    typedefs: 0,
    resolvers: 0,
    contexts: 0,
  }

  // Enums
  if (config.actions.createEnumsModule) {
    const createEnumsModuleConfig = config.actions.createEnumsModule
    const prismaFilePath = getFullPath(createEnumsModuleConfig.prismaFile)
    if (fs.existsSync(prismaFilePath)) {
      const enums = getPrismaEnum(readLines(prismaFilePath))
      const enumsKeys = actionEnum(
        createEnumsModuleConfig.enumsModuleFolder,
        config.moduleOutputFolder,
        config.importBaseTypesFrom,
        enums
      )
      meta.enums = enumsKeys.length
    } else {
      log.error(`${'❌'} file ${logRed(prismaFilePath)} not found!`)
      throw new Error(`file ${prismaFilePath} not found!`)
    }
  }

  // Typedefs && Resolvers
  const mergeModuleAction = []
  if (config.actions.mergeModuleTypedefs) {
    mergeModuleAction.push('Typedefs')
  }
  if (config.actions.mergeModuleResolvers) {
    mergeModuleAction.push('Resolvers')
  }
  if (config.actions.mergeContexts) {
    mergeModuleAction.push('Contexts')
  }

  const contexts: { moduleName: string; ctxName: string }[] = []
  const modules: { name: string; directory: string }[] = []
  config.modules.forEach((source: string) => {
    const directories = getDirectories(source)
    directories.forEach(directory => {
      const moduleName = basename(directory, extname(directory))

      let typedefsFilesLength = 0
      let resolversFilesLength = 0
      let contextsFilesLength = 0

      // TypeDefs
      if (config.actions.mergeModuleTypedefs) {
        typedefsFilesLength = actionTypeDefs(directory, config.moduleOutputFolder)
      }

      // Resolvers
      if (config.actions.mergeModuleResolvers) {
        resolversFilesLength = actionResolvers(directory, config.moduleOutputFolder)
      }

      // Contexts
      if (config.actions.mergeContexts) {
        const dataloadersModule: { moduleName: string; providerFile: string }[] = []
        const providersFiles = getFiles(join(directory, providersFolder))
        let withDbProvider = false
        providersFiles.forEach(providerFile => {
          if (providerFile.startsWith(`dl${toPascalCase(moduleName)}`)) {
            dataloadersModule.push({ moduleName, providerFile })
          }
          if (providerFile.startsWith(`Db${toPascalCase(moduleName)}`)) {
            withDbProvider = true
          }
        })

        providersFiles.forEach(providerFile => {
          if (providerFile.startsWith('_ctx')) {
            const ctxName = providerFile.replace('_ctx', '').replace('.ts', '')
            contexts.push({ moduleName, ctxName })
          }
        })
      }

      if (mergeModuleAction.length > 0) {
        meta.typedefs += typedefsFilesLength
        meta.resolvers += resolversFilesLength
        meta.contexts += contextsFilesLength
      }

      modules.push({ directory, name: moduleName })
    })
  })

  // mergeContexts
  if (config.actions.mergeContexts) {
    actionContext(contexts, config.outputFolder)
  }

  // mergeModules
  if (config.actions.mergeModules) {
    actionModules(modules, config.outputFolder)
    meta.modules = modules.length
  }

  // Done
  log.info(
    `${logGreen('✔')} success ` +
      `[${logGreen('' + meta.modules)} modules, ` +
      `${logGreen('' + meta.enums)} enums, ` +
      `${logGreen('' + meta.typedefs)} typedefs, ` +
      `${logGreen('' + meta.resolvers)} resolvers, ` +
      `${logGreen('' + meta.contexts)} contexts]`
  )
}
