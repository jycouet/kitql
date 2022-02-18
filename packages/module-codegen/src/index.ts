import { Log, logGreen, logRed } from '@kitql/helper';
import fs from 'fs';
import YAML from 'yaml';
import { TConfigFile, writeDefaultConfigFile } from './defaultConfigFile';
import { createFolderIfNotExists, getDirectories, getFiles, getFullPath } from './fileFolder';
import { getPrismaEnum } from './prismaHelper';
import { read, readLines } from './readWrite';
import { join } from 'path';
import { actionEnum } from './actionEnum';
import { pad } from './formatString';
import { actionResolvers } from './actionResolvers';
import { actionTypeDefs } from './actionTypeDefs';
import { actionContext } from './actionContexts';
import { actionModules } from './actionModules';

let log = new Log('KitQL module-codegen');

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
			let enums = getPrismaEnum(readLines(prismaFilePath));
			const enumsKeys = actionEnum(
				configFile.configs.modulesFolder,
				configFile.configs.moduleOutputFolder,
				configFile.actions.createEnumsModule.importBaseTypesFrom,
				enums
			);
			log.info(
				`${logGreen('✔')} ${logGreen('Enums')} created [${enumsKeys
					.map(c => logGreen(c))
					.join(',')}]`
			);
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
	if (mergeModuleAction.length > 0) {
		log.info(
			`${logGreen('⏳')} merging ${mergeModuleAction
				.map(c => logGreen(c))
				.join(' and ')} in modules`
		);
	}

	moduleNames.forEach(moduleName => {
		let typedefsFilesLen = 0;
		let resolversFilesLen = 0;

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

		if (mergeModuleAction.length > 0) {
			log.info(
				`${logGreen('✔')} merged - ${logGreen(pad(typedefsFilesLen, 2))} Typedefs | ${logGreen(
					pad(resolversFilesLen, 2)
				)} Resolvers for [${logGreen(moduleName)}]`
			);
		}
	});

	// mergeContexts
	if (configFile.actions.mergeContexts) {
		log.info(`${logGreen('⏳')} merging ${logGreen('Contexts')}`);
		let ctxModules = [];
		const providersFolder = 'providers';
		moduleNames.forEach(moduleName => {
			const providersFiles = getFiles(
				join(configFile.configs.modulesFolder, moduleName, providersFolder)
			);
			providersFiles.forEach(providerFile => {
				if (providerFile.startsWith('_ctx')) {
					const ctxName = providerFile.replace('_ctx', '').replace('.ts', '');
					ctxModules.push({ moduleName, ctxName });
				}
			});
		});
		actionContext(ctxModules, configFile.configs.outputFolder);

		log.info(
			`${logGreen('✔')} merged ${logGreen(
				pad(ctxModules.length, 2)
			)} contexts [${ctxModules.map(c => logGreen(c.moduleName + '#' + c.ctxName)).join(',')}]`
		);
	}

	// mergeModules
	if (configFile.actions.mergeModules) {
		log.info(`${logGreen('⏳')} merging ${logGreen('Modules')}`);
		actionModules(moduleNames, configFile.configs.outputFolder);

		log.info(
			`${logGreen('✔')} merged ${logGreen(
				pad(moduleNames.length, 2)
			)} modules [${moduleNames.map(c => logGreen(c)).join(',')}]`
		);
	}
	//
} else {
	writeDefaultConfigFile(configFilePath);
	log.info(`${logGreen('✔')} config file created: ${logGreen(configFilePath)}`);
}

// Done
log.info(`${logGreen('✔')} finished ${logGreen('successfully')}`);
