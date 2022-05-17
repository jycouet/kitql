import path from 'path';
import { write } from './readWrite';

export type TConfigFile = {
	configs: {
		modulesFolder: string;
		moduleOutputFolder: string;
		outputFolder: string;
	};
	actions: {
		createEnumsModule?: { prismaFile: string; importBaseTypesFrom: string } | false;
		mergeModuleTypedefs: Boolean;
		mergeModuleResolvers: Boolean;
		mergeContexts: Boolean;
		mergeModules: Boolean;
	};
};

export function writeDefaultConfigFile(pathFile) {
	let data = [
		`configs:`,
		`  modulesFolder: ./src/lib/modules`,
		`  moduleOutputFolder: _kitql`,
		`  outputFolder: ./src/lib/graphql/_kitql`,
		``,
		`actions:`,
		`  # - createBaseStructure: true`,
		`  createEnumsModule:`,
		`    prismaFile: ./prisma/schema.prisma`,
		`    importBaseTypesFrom: $graphql/_kitql/graphqlTypes`,
		``,
		`  mergeModuleTypedefs: true`,
		`  mergeModuleResolvers: true`,
		`  mergeContexts: true`,
		`  mergeModules: true`,
		``
	];

	write(path.join(pathFile), data);
}
