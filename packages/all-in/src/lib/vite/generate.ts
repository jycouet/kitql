import { green, Log, red } from '@kitql/helper'
import { basename, extname, join } from 'node:path'

import { actionContext } from './actionContexts.js'
import { actionEnum } from './actionEnum.js'
import { actionModuleContext } from './actionModuleContext.js'
import { actionModules } from './actionModules.js'
import { actionResolvers } from './actionResolvers.js'
import { actionTypeDefs } from './actionTypeDefs.js'
import { getDirectories, getFiles, getFullPath } from './fileFolder.js'
import { toPascalCase } from './formatString.js'
import type { KitQLVite } from './KitQLVite.js'
import { getPrismaEnum } from './prismaHelper.js'
import { readLines } from './readWrite.js'
import { updateModuleTypes } from './updateModuleTypes.js'

export function generate(log: Log, config?: KitQLVite) {
  const providersFolder = 'providers' as const

  const {
    outputFolder,
    moduleOutputFolder,
    importBaseTypesFrom,
    modules,
    localDev,
    typeDefsStyle,
  } = {
    outputFolder: 'src/lib/graphql/$kitql',
    moduleOutputFolder: '$kitql',
    importBaseTypesFrom: '$graphql/$kitql/graphqlTypes',
    modules: ['src/lib/modules/*'],
    localDev: false,
    typeDefsStyle: 'gql' as KitQLVite['typeDefsStyle'],
    ...config,
  }

  const { mergeModuleTypedefs, mergeModuleResolvers, mergeContexts, mergeModules } = {
    mergeModuleTypedefs: true,
    mergeModuleResolvers: true,
    mergeContexts: true,
    mergeModules: true,
  }

  const meta = {
    enums: 0,
    modules: 0,
    typedefs: 0,
    resolvers: 0,
    contexts: 0,
  }

  // Enums
  if (config?.prismaFileForEnums) {
    const enumsModuleFolder = './src/lib/modules'
    const prismaFilePath = getFullPath(config.prismaFileForEnums)
    const prismaFileContent = readLines(prismaFilePath)

    if (prismaFileContent.length !== 0) {
      const enums = getPrismaEnum(prismaFileContent)
      const enumsKeys = actionEnum(
        enumsModuleFolder,
        moduleOutputFolder,
        importBaseTypesFrom,
        enums,
        localDev,
      )
      meta.enums = enumsKeys.length
      // log.info(`${green('✔')} ${green('Enums')} created [${enumsKeys.map(c => green(c)).join(',')}]`)
    } else {
      log.error(`file ${red(prismaFilePath)} not found!`)
      // throw new Error(`file ${prismaFilePath} not found!`)
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
  if (mergeModuleAction.length > 0) {
    // log.info(`${green('⏳')} merging ${mergeModuleAction.map(c => green(c)).join(' and ')} in modules`)
  }

  const contexts: { moduleName: string; ctxName: string }[] = []
  const modulesObj: { name: string; directory: string }[] = []
  modules.forEach((source: string) => {
    const directories = getDirectories(source)
    directories.forEach(directory => {
      const moduleName = basename(directory, extname(directory))

      let typedefsFilesLength = 0
      let resolversFilesLength = 0
      let contextsFilesLength = 0

      // TypeDefs
      if (mergeModuleTypedefs) {
        typedefsFilesLength = actionTypeDefs(directory, moduleOutputFolder, localDev, typeDefsStyle)
      }

      // Resolvers
      if (mergeModuleResolvers) {
        resolversFilesLength = actionResolvers(directory, moduleOutputFolder)
      }

      // Contexts
      if (mergeContexts) {
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
        contextsFilesLength = actionModuleContext(
          dataloadersModule,
          directory,
          moduleOutputFolder,
          importBaseTypesFrom,
          withDbProvider,
        )

        // log.info(`${green('⏳')} merging ${green('Contexts')}`)
        providersFiles.forEach(providerFile => {
          if (providerFile.startsWith('_ctx')) {
            const ctxName = providerFile.replace('_ctx', '').replace('.ts', '')
            contexts.push({ moduleName, ctxName })
          }
        })
      }

      // updateModuleTypes
      updateModuleTypes(directory, moduleOutputFolder, localDev)

      if (mergeModuleAction.length > 0) {
        meta.typedefs += typedefsFilesLength
        meta.resolvers += resolversFilesLength
        meta.contexts += contextsFilesLength
        // log.info(
        //   `${green('✔')} merged - ${green(pad(typedefsFilesLength, 2))} Typedefs | ${green(
        //     pad(resolversFilesLength, 2)
        //   )} Resolvers | ${green(pad(contextsFilesLength, 2))} Contexts for [${green(name)}]`
        // )
      }

      modulesObj.push({ directory, name: moduleName })
    })
  })

  // mergeContexts
  if (mergeContexts) {
    // log.info(`${green('⏳')} merging ${green('Contexts')}`)
    actionContext(contexts, outputFolder)

    // log.info(
    //   `${green('✔')} merged ${green(pad(contexts.length, 2))} contexts [${contexts
    //     .map(c => green(c.moduleName + '#' + c.ctxName))
    //     .join(',')}]`
    // )
  }

  // "if" or collapsing purpose
  // if (true) {
  // mergeModuleContexts
  // if (config.actions.mergeContexts) {
  // 	log.info(`${green('⏳')} merging modules ${green('Contexts')}`);
  // 	const providersFolder = 'providers';
  // 	moduleNames.forEach(moduleName => {
  // 		let dataloadersModule = [];
  // 		const providersFiles = getFiles(
  // 			join(config.config.modulesFolder, moduleName, providersFolder)
  // 		);
  // 		providersFiles.forEach(providerFile => {
  // 			if (providerFile.startsWith(`dl${toPascalCase(moduleName)}`)) {
  // 				dataloadersModule.push({ moduleName, providerFile });
  // 			}
  // 		});
  // 		actionModuleContext(
  // 			dataloadersModule,
  // 			config.config.modulesFolder,
  // 			moduleName,
  // 			config.config.moduleOutputFolder
  // 		);
  // 		log.info(
  // 			`${green('✔')} merged ${green(
  // 				pad(dataloadersModule.length, 2)
  // 			)} contexts [${dataloadersModule
  // 				.map(c => green(c.moduleName + '#' + c.ctxName))
  // 				.join(',')}]`
  // 		);
  // 	});
  // }
  //
  // }

  // mergeModules
  if (mergeModules) {
    // log.info(`${green('⏳')} merging ${green('Modules')}`)
    actionModules(modulesObj, outputFolder)
    meta.modules = modulesObj.length
    // log.info(
    //   `${green('✔')} merged ${green(pad(modules.length, 2))} modules [${modules
    //     .map(c => green(c))
    //     .join(',')}]`
    // )
  }

  // Done
  // log.info(`${green('✔')} finished ${green('successfully')}`)
  log.info(
    `${green('✔')} success ` +
      `[${green(String(meta.modules))} modules, ` +
      `${green(String(meta.enums))} enums, ` +
      `${green(String(meta.typedefs))} typedefs, ` +
      `${green(String(meta.resolvers))} resolvers, ` +
      `${green(String(meta.contexts))} contexts]`,
  )
}
