import { Log, logGreen, logRed } from '@kitql/helper';
import fs from 'fs';
import { join } from 'path';
import YAML from 'yaml';
import { actionContext } from './actionContexts';
import { actionEnum } from './actionEnum';
import { actionModuleContext } from './actionModuleContext';
import { actionModules } from './actionModules';
import { actionResolvers } from './actionResolvers';
import { actionTypeDefs } from './actionTypeDefs';
import { TConfigFile, writeDefaultConfigFile } from './defaultConfigFile';
import { getDirectories, getFiles, getFullPath } from './fileFolder';
import { pad, toPascalCase } from './formatString';
import { getPrismaEnum } from './prismaHelper';
import { read, readLines } from './readWrite';

const log = new Log('KitQL module-codegen');

const configFilePath = getFullPath('.kitql.yaml');

if (fs.existsSync(configFilePath)) {
  log.info(`${logGreen('✔')} config file found: ${logGreen(configFilePath)}`);
  const content = read(configFilePath);
  const configFile = YAML.parse(content) as TConfigFile;

  const moduleNames = getDirectories(configFile.configs.modulesFolder);

  // Enums
  if (configFile.actions.createEnumsModule) {
    log.info(`${logGreen('⏳')} creating ${logGreen('Enums')}`);
    const prismaFilePath = getFullPath(configFile.actions.createEnumsModule.prismaFile);
    if (fs.existsSync(prismaFilePath)) {
      const enums = getPrismaEnum(readLines(prismaFilePath));
      const enumsKeys = actionEnum(
        configFile.configs.modulesFolder,
        configFile.configs.moduleOutputFolder,
        configFile.actions.createEnumsModule.importBaseTypesFrom,
        enums
      );
      log.info(`${logGreen('✔')} ${logGreen('Enums')} created [${enumsKeys.map(c => logGreen(c)).join(',')}]`);
    } else {
      log.error(`${'❌'} file ${logRed(prismaFilePath)} not found!`);
      throw new Error(`file ${prismaFilePath} not found!`);
    }
  }

  // Typedefs && Resolvers
  const mergeModuleAction = [];
  if (configFile.actions.mergeModuleTypedefs) {
    mergeModuleAction.push('Typedefs');
  }
  if (configFile.actions.mergeModuleResolvers) {
    mergeModuleAction.push('Resolvers');
  }
  if (configFile.actions.mergeContexts) {
    mergeModuleAction.push('Contexts');
  }
  if (mergeModuleAction.length > 0) {
    log.info(`${logGreen('⏳')} merging ${mergeModuleAction.map(c => logGreen(c)).join(' and ')} in modules`);
  }

  moduleNames.forEach(moduleName => {
    let typedefsFilesLen = 0;
    let resolversFilesLen = 0;
    let contextsFilesLen = 0;

    // TypeDefs
    if (configFile.actions.mergeModuleTypedefs) {
      typedefsFilesLen = actionTypeDefs(
        moduleName,
        configFile.configs.modulesFolder,
        configFile.configs.moduleOutputFolder
      );
    }

    // Resolvers
    if (configFile.actions.mergeModuleResolvers) {
      resolversFilesLen = actionResolvers(
        moduleName,
        configFile.configs.modulesFolder,
        configFile.configs.moduleOutputFolder
      );
    }

    // Contexts
    if (configFile.actions.mergeContexts) {
      const providersFolder = 'providers';
      const dataloadersModule = [];
      const providersFiles = getFiles(join(configFile.configs.modulesFolder, moduleName, providersFolder));
      let withDbProvider = false;
      providersFiles.forEach(providerFile => {
        if (providerFile.startsWith(`dl${toPascalCase(moduleName)}`)) {
          dataloadersModule.push({ moduleName, providerFile });
        }
        if (providerFile.startsWith(`Db${toPascalCase(moduleName)}`)) {
          withDbProvider = true;
        }
      });
      contextsFilesLen = actionModuleContext(
        dataloadersModule,
        configFile.configs.modulesFolder,
        moduleName,
        configFile.configs.moduleOutputFolder,
        withDbProvider
      );
    }

    if (mergeModuleAction.length > 0) {
      log.info(
        `${logGreen('✔')} merged - ${logGreen(pad(typedefsFilesLen, 2))} Typedefs | ${logGreen(
          pad(resolversFilesLen, 2)
        )} Resolvers | ${logGreen(pad(contextsFilesLen, 2))} Contexts for [${logGreen(moduleName)}]`
      );
    }
  });

  // mergeContexts
  if (configFile.actions.mergeContexts) {
    log.info(`${logGreen('⏳')} merging ${logGreen('Contexts')}`);
    const ctxModules = [];
    const providersFolder = 'providers';
    moduleNames.forEach(moduleName => {
      const providersFiles = getFiles(join(configFile.configs.modulesFolder, moduleName, providersFolder));
      providersFiles.forEach(providerFile => {
        if (providerFile.startsWith('_ctx')) {
          const ctxName = providerFile.replace('_ctx', '').replace('.ts', '');
          ctxModules.push({ moduleName, ctxName });
        }
      });
    });
    actionContext(ctxModules, configFile.configs.outputFolder);

    log.info(
      `${logGreen('✔')} merged ${logGreen(pad(ctxModules.length, 2))} contexts [${ctxModules
        .map(c => logGreen(c.moduleName + '#' + c.ctxName))
        .join(',')}]`
    );
  }

  // mergeModuleContexts
  // if (configFile.actions.mergeContexts) {
  // 	log.info(`${logGreen('⏳')} merging modules ${logGreen('Contexts')}`);
  // 	const providersFolder = 'providers';
  // 	moduleNames.forEach(moduleName => {
  // 		let dataloadersModule = [];
  // 		const providersFiles = getFiles(
  // 			join(configFile.configs.modulesFolder, moduleName, providersFolder)
  // 		);
  // 		providersFiles.forEach(providerFile => {
  // 			if (providerFile.startsWith(`dl${toPascalCase(moduleName)}`)) {
  // 				dataloadersModule.push({ moduleName, providerFile });
  // 			}
  // 		});
  // 		actionModuleContext(
  // 			dataloadersModule,
  // 			configFile.configs.modulesFolder,
  // 			moduleName,
  // 			configFile.configs.moduleOutputFolder
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

  // mergeModules
  if (configFile.actions.mergeModules) {
    log.info(`${logGreen('⏳')} merging ${logGreen('Modules')}`);
    actionModules(moduleNames, configFile.configs.outputFolder);

    log.info(
      `${logGreen('✔')} merged ${logGreen(pad(moduleNames.length, 2))} modules [${moduleNames
        .map(c => logGreen(c))
        .join(',')}]`
    );
  }
  //
} else {
  writeDefaultConfigFile(configFilePath);
  log.info(`${logGreen('✔')} config file created: ${logGreen(configFilePath)}`);
}

// Done
log.info(`${logGreen('✔')} finished ${logGreen('successfully')}`);
