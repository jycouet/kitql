import { join, relative } from 'path';
import { write } from './readWrite';

export function actionModules(modules: {directory: string, name:string}[], outputFolder: string) {
  const modulesImports: string[] = []
  const modulesExports: string[] = [];
  const dataAppModules = []

  modules.forEach(module => {
    const moduleRelativePath = relative(outputFolder, module.directory);
    modulesImports.push(`import { ${module.name}Module } from '${moduleRelativePath}';`);
    modulesExports.push(`  ${module.name}Module,`);
  })

  dataAppModules.push(modulesImports.join("\n"));
  dataAppModules.push(``)
  dataAppModules.push(`export const modules = [`)
  dataAppModules.push(modulesExports.join("\n"));
  dataAppModules.push(`];`)

  write(join(outputFolder, '_appModules.ts'), dataAppModules)
}
