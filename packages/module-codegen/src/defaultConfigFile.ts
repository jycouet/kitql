import path from 'path';
import { write } from './readWrite';

export type TConfigFile = {
	configs: {
		modulesFolder: String;
		outputFolder: String;
	};
	actions: {
		createEnumsModule: { prismaFile: String };
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
	data.push(`  outputFolder: ./src/lib/graphql/_kitql`);
	data.push(``);
	data.push(`actions:`);
	data.push(`  # - createBaseStructure: true`);
	data.push(`  createEnumsModule:`);
	data.push(`    prismaFile: ./prisma/schema.prisma`);
	data.push(`  mergeModuleTypedefs: true`);
	data.push(`  mergeModuleResolvers: true`);
	data.push(`  mergeContexts: true`);
	data.push(`  mergeModules: true`);
	data.push(``);

	write(path.join(pathFile), data);
}
