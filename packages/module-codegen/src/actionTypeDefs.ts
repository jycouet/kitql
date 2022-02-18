import { join } from 'path';
import { createFolderIfNotExists, getFiles } from './fileFolder';
import { read, write } from './readWrite';

export function actionTypeDefs(
	moduleName: string,
	modulesFolder: string,
	moduleOutputFolder: string
) {
	const typedefsFolder = 'typedefs';

	const typedefsFiles = getFiles(join(modulesFolder, moduleName, typedefsFolder));

	let dataTypedefs = [];

	dataTypedefs.push(`import { gql } from 'graphql-modules'`);
	dataTypedefs.push(``);
	dataTypedefs.push(`export const typeDefs = gql${'`'}`);
	typedefsFiles.forEach(typedefs => {
		dataTypedefs.push(read(join(modulesFolder, moduleName, typedefsFolder, typedefs)));
	});
	dataTypedefs.push(`${'`'};`);

	createFolderIfNotExists(join(modulesFolder, moduleName, moduleOutputFolder));

	write(join(modulesFolder, moduleName, moduleOutputFolder, 'typedefs.ts'), dataTypedefs);

	return typedefsFiles.length;
}
