import { createFolderIfNotExists } from './fileFolder';
import { toPascalCase } from './formatString';
import { join } from 'path';
import { write } from './readWrite';

export function actionContext(ctxModules, outputFolder: string) {
	let dataCtxModules = [];

	ctxModules.forEach(ctx => {
		dataCtxModules.push(
			`import { getCtx${toPascalCase(ctx.ctxName)} } from '../../modules/${
				ctx.moduleName
			}/providers/_ctx${toPascalCase(ctx.ctxName)}';`
		);
	});

	dataCtxModules.push(``);
	dataCtxModules.push(`export function getCtxModules(prisma: any) {`);
	dataCtxModules.push(`	return {`);
	ctxModules.forEach(ctx => {
		dataCtxModules.push(`		...getCtx${toPascalCase(ctx.ctxName)}(prisma),`);
	});
	dataCtxModules.push(`	};`);
	dataCtxModules.push(`}`);

	createFolderIfNotExists(join(outputFolder));

	write(join(outputFolder, '_ctxModules.ts'), dataCtxModules);
}
