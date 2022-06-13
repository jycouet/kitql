import { Log, logGreen, logRed } from '@kitql/helper'
import fs from 'fs'
import { join, basename, extname } from 'path'
import YAML from 'yaml'
import { actionContext } from './actionContexts'
import { actionEnum } from './actionEnum'
import { actionModuleContext } from './actionModuleContext'
import { actionModules } from './actionModules'
import { actionResolvers } from './actionResolvers'
import { actionTypeDefs } from './actionTypeDefs'
import { TConfigFile, writeDefaultConfigFile } from './defaultConfigFile'
import { getDirectories, getFiles, getFullPath } from './fileFolder'
import { pad, toPascalCase } from './formatString'
import { getPrismaEnum } from './prismaHelper'
import { read, readLines } from './readWrite'

const log = new Log('KitQL module-codegen')

const configFilePath = getFullPath('.kitql.yaml')
const providersFolder = 'providers' as const

if (fs.existsSync(configFilePath)) {
  log.info(`${logGreen('✔')} config file found: ${logGreen(configFilePath)}`)
  const content = read(configFilePath)
  const configFile = YAML.parse(content) as TConfigFile

  Object.entries(configFile.generates).map(([outputFolder, config]) => {
    log.info(`${logGreen('⏳')} starting generation for ${logGreen(outputFolder)}`)

    // Enums
    if (config.actions.createEnumsModule) {
      log.info(`${logGreen('⏳')} creating ${logGreen('Enums')}`)
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
        log.info(`${logGreen('✔')} ${logGreen('Enums')} created [${enumsKeys.map(c => logGreen(c)).join(',')}]`)
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
    if (mergeModuleAction.length > 0) {
      log.info(`${logGreen('⏳')} merging ${mergeModuleAction.map(c => logGreen(c)).join(' and ')} in modules`)
    }

    const contexts = []
    const modules = []
    config.modules.forEach((source: string) => {
      const directories = getDirectories(source)
      directories.forEach(directory => {
        const name = basename(directory, extname(directory))

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
          const dataloadersModule = []
          const providersFiles = getFiles(join(directory, providersFolder))
          let withDbProvider = false
          providersFiles.forEach(providerFile => {
            if (providerFile.startsWith(`dl${toPascalCase(name)}`)) {
              dataloadersModule.push({ name, providerFile })
            }
            if (providerFile.startsWith(`Db${toPascalCase(name)}`)) {
              withDbProvider = true
            }
          })
          contextsFilesLength = actionModuleContext(
            dataloadersModule,
            directory,
            config.moduleOutputFolder,
            config.importBaseTypesFrom,
            withDbProvider
          )

          log.info(`${logGreen('⏳')} merging ${logGreen('Contexts')}`)
          providersFiles.forEach(providerFile => {
            if (providerFile.startsWith('_ctx')) {
              const ctxName = providerFile.replace('_ctx', '').replace('.ts', '')
              contexts.push({ name, ctxName })
            }
          })
        }

        if (mergeModuleAction.length > 0) {
          log.info(
            `${logGreen('✔')} merged - ${logGreen(pad(typedefsFilesLength, 2))} Typedefs | ${logGreen(
              pad(resolversFilesLength, 2)
            )} Resolvers | ${logGreen(pad(contextsFilesLength, 2))} Contexts for [${logGreen(name)}]`
          )
        }

        modules.push({ directory, name })
      })
    })

    // mergeContexts
    if (config.actions.mergeContexts) {
      log.info(`${logGreen('⏳')} merging ${logGreen('Contexts')}`)
      actionContext(contexts, outputFolder)

      log.info(
        `${logGreen('✔')} merged ${logGreen(pad(contexts.length, 2))} contexts [${contexts
          .map(c => logGreen(c.moduleName + '#' + c.ctxName))
          .join(',')}]`
      )
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
    if (config.actions.mergeModules) {
      log.info(`${logGreen('⏳')} merging ${logGreen('Modules')}`)
      actionModules(modules, outputFolder)
      log.info(
        `${logGreen('✔')} merged ${logGreen(pad(modules.length, 2))} modules [${modules
          .map(c => logGreen(c))
          .join(',')}]`
      )
    }
  })

  //
} else {
  writeDefaultConfigFile(configFilePath)
  log.info(`${logGreen('✔')} config file created: ${logGreen(configFilePath)}`)
}

// Done
log.info(`${logGreen('✔')} finished ${logGreen('successfully')}`)
