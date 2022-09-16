import { join, basename, extname } from 'path'
import { createFolderIfNotExists } from './fileFolder'
import { toPascalCase } from './formatString'
import { write } from './readWrite'

// dlIchttsGetByIds
// dl{EntityName}Get{Function}s => ctx{EntityName}_Dl_{Function}
// ctxIchtts_Dl_ById
export function actionModuleContext(
  dataloadersModule: { moduleName: string; providerFile: string }[], // ["dlIchttsGetByIds"]
  moduleFolder: string, // src/lib/modules
  moduleOutputFolder: string, //$kitql
  importBaseTypesFrom: string,
  withDbProvider: boolean
) {
  const dataCtxModules = []
  const moduleName = basename(moduleFolder, extname(moduleFolder))

  const moduleNamePascalCase = toPascalCase(moduleName)
  const functionsName: string[] = []
  dataloadersModule.forEach(dataloader => {
    const functionName = dataloader.providerFile
      .substring(moduleName.length + 2 + 3) // + 2 => dl & + 3 => Get
      .replace(`s.ts`, '')
    functionsName.push(functionName)
  })

  if (withDbProvider) {
    dataCtxModules.push(`import { load_DataLoader } from '$graphql/helpers/dataLoaderHelper';`)
    dataCtxModules.push(`import { type IKitQLContext } from '$graphql/kitQLServer';`)
    if (functionsName.length > 0) {
      dataCtxModules.push(`import { type ${moduleNamePascalCase} } from '${importBaseTypesFrom}';`)
    }
    dataCtxModules.push(`import { Db${moduleNamePascalCase} } from '../providers/Db${moduleNamePascalCase}';`)
    functionsName.forEach(functionName => {
      dataCtxModules.push(
        `import { dl${moduleNamePascalCase}Get${functionName}s } from '../providers/dl${moduleNamePascalCase}Get${functionName}s';`
      )
    })

    dataCtxModules.push(``)
    dataCtxModules.push(`export function ctx${moduleNamePascalCase}(ctx: IKitQLContext) {`)
    dataCtxModules.push(`	return ctx.injector.get(Db${moduleNamePascalCase});`)
    dataCtxModules.push(`}`)
    dataCtxModules.push(``)
  } else {
    dataCtxModules.push(`// No DbProvider found`)
    dataCtxModules.push(`export {}`)
  }

  functionsName.forEach(functionName => {
    dataCtxModules.push(
      `export async function ctx${moduleNamePascalCase}_Dl_${functionName}(ctx: IKitQLContext, id: string | number) {`
    )
    dataCtxModules.push(
      `	return load_DataLoader<${moduleNamePascalCase}>(ctx.injector, dl${moduleNamePascalCase}Get${functionName}s.provide, id);`
    )
    dataCtxModules.push(`}`)
  })

  dataCtxModules.push(``)

  createFolderIfNotExists(join(moduleFolder, moduleOutputFolder))

  write(join(moduleFolder, moduleOutputFolder, 'ctx.ts'), dataCtxModules)

  return functionsName.length + (withDbProvider ? 1 : 0)
}
