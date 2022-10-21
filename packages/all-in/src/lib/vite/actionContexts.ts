import { join } from 'path'

import { createFolderIfNotExists } from './fileFolder.js'
import { toPascalCase } from './formatString.js'
import { write } from './readWrite.js'

export function actionContext(ctxModules: { ctxName: string; moduleName: string }[], outputFolder: string) {
  const dataCtxModules = []

  ctxModules.forEach(ctx => {
    dataCtxModules.push(
      `import { getCtx${toPascalCase(ctx.ctxName)} } from '../../modules/${ctx.moduleName}/providers/_ctx${toPascalCase(
        ctx.ctxName
      )}';`
    )
  })

  dataCtxModules.push(``)
  dataCtxModules.push(`export function getCtxModules(prisma: any) {`)
  dataCtxModules.push(`	return {`)
  ctxModules.forEach(ctx => {
    dataCtxModules.push(`		...getCtx${toPascalCase(ctx.ctxName)}(prisma),`)
  })
  dataCtxModules.push(`	};`)
  dataCtxModules.push(`}`)

  createFolderIfNotExists(join(outputFolder))

  write(join(outputFolder, '_ctxModules.ts'), dataCtxModules)
}
