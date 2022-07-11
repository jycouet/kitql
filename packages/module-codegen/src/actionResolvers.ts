import { join, posix } from 'path'
import { createFolderIfNotExists, getFiles, getFileWODots, getFileWOTS } from './fileFolder'
import { write } from './readWrite'

export function actionResolvers(moduleFolder: string, moduleOutputFolder: string) {
  const resolversFolder = 'resolvers'

  const relativeResolversFolder = posix.relative(moduleOutputFolder, resolversFolder)

  const resolversFiles = getFiles(join(moduleFolder, resolversFolder))
  const dataResolvers = []
  resolversFiles.forEach(resolver => {
    dataResolvers.push(
      `import { resolvers as ${getFileWODots(resolver)} } from '${join(relativeResolversFolder, getFileWOTS(resolver))}';`
    )
  })
  dataResolvers.push(``)
  dataResolvers.push(`export const resolvers = [`)
  resolversFiles.forEach(resolver => {
    dataResolvers.push(`  ${getFileWODots(resolver)},`)
  })
  dataResolvers.push(`];`)

  createFolderIfNotExists(join(moduleFolder, moduleOutputFolder))

  write(join(moduleFolder, moduleOutputFolder, 'resolvers.ts'), dataResolvers)

  return resolversFiles.length
}
