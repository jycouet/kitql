import { Log, logGreen, logRed } from '@kitql/helper'
import { basename, extname, join } from 'path'

import type { KitQLVite } from './KitQLVite.js'
import { actionContext } from './actionContexts.js'
import { actionEnum } from './actionEnum.js'
import { actionModuleContext } from './actionModuleContext.js'
import { actionModules } from './actionModules.js'
import { actionResolvers } from './actionResolvers.js'
import { actionTypeDefs } from './actionTypeDefs.js'
import { getDirectories, getFiles, getFullPath } from './fileFolder.js'
import { toPascalCase } from './formatString.js'
import { getPrismaEnum } from './prismaHelper.js'
import { readLines } from './readWrite.js'

export function generate(config?: KitQLVite) {
  const log = new Log('KitQL')

  const providersFolder = 'providers' as const

  const { outputFolder, moduleOutputFolder, importBaseTypesFrom, modules } = {
    outputFolder: 'src/lib/graphql/$kitql',
    moduleOutputFolder: '$kitql',
    importBaseTypesFrom: '$graphql/$kitql/graphqlTypes',
    modules: ['src/lib/modules/*'],
    ...config,
  }
  const { mergeModuleTypedefs, mergeModuleResolvers, mergeContexts, mergeModules } = {
    mergeModuleTypedefs: true,
    mergeModuleResolvers: true,
    mergeContexts: true,
    mergeModules: true,
    ...config?.actions,
  }

  const meta = {
    enums: 0,
    modules: 0,
    typedefs: 0,
    resolvers: 0,
    contexts: 0,
  }

  // Enums
  if (config?.actions.createEnumsModule) {
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
      // log.info(`${logGreen('✔')} ${logGreen('Enums')} created [${enumsKeys.map(c => logGreen(c)).join(',')}]`)
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
  if (mergeModuleAction.length > 0) {
    // log.info(`${logGreen('⏳')} merging ${mergeModuleAction.map(c => logGreen(c)).join(' and ')} in modules`)
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
        typedefsFilesLength = actionTypeDefs(directory, moduleOutputFolder)
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
          withDbProvider
        )

        // log.info(`${logGreen('⏳')} merging ${logGreen('Contexts')}`)
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
        // log.info(
        //   `${logGreen('✔')} merged - ${logGreen(pad(typedefsFilesLength, 2))} Typedefs | ${logGreen(
        //     pad(resolversFilesLength, 2)
        //   )} Resolvers | ${logGreen(pad(contextsFilesLength, 2))} Contexts for [${logGreen(name)}]`
        // )
      }

      modulesObj.push({ directory, name: moduleName })
    })
  })

  // mergeContexts
  if (mergeContexts) {
    // log.info(`${logGreen('⏳')} merging ${logGreen('Contexts')}`)
    actionContext(contexts, outputFolder)

    // log.info(
    //   `${logGreen('✔')} merged ${logGreen(pad(contexts.length, 2))} contexts [${contexts
    //     .map(c => logGreen(c.moduleName + '#' + c.ctxName))
    //     .join(',')}]`
    // )
  }

  // "if" or collapsing purpose
  // if (true) {
  // mergeModuleContexts
  // if (config.actions.mergeContexts) {
  // 	log.info(`${logGreen('⏳')} merging modules ${logGreen('Contexts')}`);
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
  // 			`${logGreen('✔')} merged ${logGreen(
  // 				pad(dataloadersModule.length, 2)
  // 			)} contexts [${dataloadersModule
  // 				.map(c => logGreen(c.moduleName + '#' + c.ctxName))
  // 				.join(',')}]`
  // 		);
  // 	});
  // }
  //
  // }

  // mergeModules
  if (mergeModules) {
    // log.info(`${logGreen('⏳')} merging ${logGreen('Modules')}`)
    actionModules(modulesObj, outputFolder)
    meta.modules = modulesObj.length
    // log.info(
    //   `${logGreen('✔')} merged ${logGreen(pad(modules.length, 2))} modules [${modules
    //     .map(c => logGreen(c))
    //     .join(',')}]`
    // )
  }

  //

  // Done
  // log.info(`${logGreen('✔')} finished ${logGreen('successfully')}`)
  log.info(
    `${logGreen('✔')} success ` +
      `[${logGreen('' + meta.modules)} modules, ` +
      `${logGreen('' + meta.enums)} enums, ` +
      `${logGreen('' + meta.typedefs)} typedefs, ` +
      `${logGreen('' + meta.resolvers)} resolvers, ` +
      `${logGreen('' + meta.contexts)} contexts]`
  )
}
