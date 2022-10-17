import { join } from 'path'
import { createFolderIfNotExists, getFiles } from './fileFolder'
import { read, write } from './readWrite'

export function actionTypeDefs(moduleFolder: string, moduleOutputFolder: string) {
  const typedefsFolder = 'typedefs'

  const typedefsFiles = getFiles(join(moduleFolder, typedefsFolder))

  const dataTypedefs = []
  if (typedefsFiles.length > 0) {
    dataTypedefs.push(`import { gql } from 'graphql-modules'`)
    dataTypedefs.push(``)
    dataTypedefs.push(`export const typeDefs = gql${'`'}`)
    typedefsFiles.forEach(typedefs => {
      dataTypedefs.push(read(join(moduleFolder, typedefsFolder, typedefs)))
    })
    dataTypedefs.push(`${'`'};`)
  } else {
    dataTypedefs.push(`// No typedefs!`)
    dataTypedefs.push(``)
    dataTypedefs.push(`export const typeDefs = null`)
  }

  createFolderIfNotExists(join(moduleFolder, moduleOutputFolder))

  write(join(moduleFolder, moduleOutputFolder, 'typedefs.ts'), dataTypedefs)

  return typedefsFiles.length
}
