import { join } from 'path'
import { createFolderIfNotExists, getFiles, getFileWODots, getFileWOTS } from './fileFolder'
import { write } from './readWrite'

export function actionResolvers(moduleName: string, modulesFolder: string, moduleOutputFolder: string) {
  const resolversFolder = 'resolvers'

  const resolversFiles = getFiles(join(modulesFolder, moduleName, resolversFolder))
  const dataResolvers = []
  resolversFiles.forEach(resolver => {
    dataResolvers.push(
      `import { resolvers as ${getFileWODots(resolver)} } from '../resolvers/${getFileWOTS(resolver)}';`
    )
  })
  dataResolvers.push(``)
  dataResolvers.push(`export const resolvers = [`)
  resolversFiles.forEach(resolver => {
    dataResolvers.push(`  ${getFileWODots(resolver)},`)
  })
  dataResolvers.push(`];`)

  createFolderIfNotExists(join(modulesFolder, moduleName, moduleOutputFolder))

  write(join(modulesFolder, moduleName, moduleOutputFolder, 'resolvers.ts'), dataResolvers)

  return resolversFiles.length
}
