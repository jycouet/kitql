import { join } from 'path'

import { createFolderIfNotExists, getFiles } from './fileFolder.js'
import { read, write } from './readWrite.js'

export function actionTypeDefs(
  moduleFolder: string,
  moduleOutputFolder: string,
  localDev: boolean,
  typeDefsStyle: 'string' | 'gql'
) {
  const typedefsFolder = 'typedefs'

  const typedefsFiles = getFiles(join(moduleFolder, typedefsFolder))

  const dataTypedefs = []
  const prefix = typeDefsStyle === 'gql' ? 'gql' : ''

  if (typedefsFiles.length > 0) {
    if (typeDefsStyle === 'gql') {
      dataTypedefs.push(`import { gql } from ${localDev ? `'graphql-modules'` : `'@kitql/all-in'`}`)
      dataTypedefs.push(``)
    }
    dataTypedefs.push(`export const typeDefs = ${prefix}\``)
    typedefsFiles.forEach(typedefs => {
      dataTypedefs.push(read(join(moduleFolder, typedefsFolder, typedefs)))
    })
    dataTypedefs.push(`\`;`)
  } else {
    dataTypedefs.push(`// No typedefs!`)
    dataTypedefs.push(``)
    dataTypedefs.push(`export const typeDefs = null`)
  }

  createFolderIfNotExists(join(moduleFolder, moduleOutputFolder))

  write(join(moduleFolder, moduleOutputFolder, 'typedefs.ts'), dataTypedefs)

  return typedefsFiles.length
}
