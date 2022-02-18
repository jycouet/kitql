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
	let data = [];
	data.push(`configs:`);
	data.push(`  modulesFolder: ./src/lib/modules`);
	data.push(`  moduleOutputFolder: _kitql`);
	data.push(`  outputFolder: ./src/lib/graphql/_kitql`);
	data.push(``);
	data.push(`actions:`);
	data.push(`  # - createBaseStructure: true`);
	data.push(`  createEnumsModule:`);
	data.push(`    prismaFile: ./prisma/schema.prisma`);
	data.push(`    importBaseTypesFrom: $graphql/_kitql/graphqlTypes`);
	data.push(``);
	data.push(`  mergeModuleTypedefs: true`);
	data.push(`  mergeModuleResolvers: true`);
	data.push(`  mergeContexts: true`);
	data.push(`  mergeModules: true`);
	data.push(``);

	write(path.join(pathFile), data);
}
