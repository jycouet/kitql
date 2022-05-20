import { join } from 'path'
import { write } from './readWrite'

export function actionModules(moduleNames: string[], outputFolder: string) {
  const dataAppModules = []
  moduleNames.forEach(moduleName => {
    dataAppModules.push(`import { ${moduleName}Module } from '$modules/${moduleName}';`)
  })
  dataAppModules.push(``)
  dataAppModules.push(`export const modules = [`)
  moduleNames.forEach(moduleName => {
    dataAppModules.push(`  ${moduleName}Module,`)
  })
  dataAppModules.push(`];`)

  write(join(outputFolder, '_appModules.ts'), dataAppModules)
}
