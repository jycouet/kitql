import { existsSync } from 'fs'
import { join } from 'path'

import { createFolderIfNotExists } from './fileFolder.js'
import { toPascalCase } from './formatString.js'
import { write } from './readWrite.js'

export function actionEnum(
  enumsModuleFolder: string,
  moduleOutputFolder: string,
  importBaseTypesFrom: string,
  enums: Record<string, string[]>
) {
  // Typedefs
  createFolderIfNotExists(join(enumsModuleFolder, '_enums'))
  createFolderIfNotExists(join(enumsModuleFolder, '_enums', 'typedefs'))

  for (const key in enums) {
    const list = enums[key]
    const enumFileData = []

    enumFileData.push(`enum ${key} {`)
    list.forEach(c => {
      enumFileData.push(`\t${c}`)
    })
    enumFileData.push(`}`)
    enumFileData.push(``)

    write(join(enumsModuleFolder, '_enums', 'typedefs', `ENUM.${key}.graphql`), enumFileData)
  }

  // Lists
  createFolderIfNotExists(join(enumsModuleFolder, '_enums', 'ui'))
  createFolderIfNotExists(join(enumsModuleFolder, '_enums', 'ui', 'lists'))

  for (const key in enums) {
    const list = enums[key]
    const keyWOEnum = key.replace('Enum', '')
    const enumFileData = []

    enumFileData.push(`import { type ${key} } from '${importBaseTypesFrom}';`)
    enumFileData.push(``)
    enumFileData.push(`export const ${keyWOEnum}List: Record<${key}, string> = {`)
    list.forEach((c, i) => {
      const isLast = i === list.length - 1
      enumFileData.push(`\t${c}: '${toPascalCase(c.toLowerCase())}'${isLast ? '' : ','}`)
    })
    enumFileData.push(`};`)
    enumFileData.push(``)

    // Write this file only if it doesn't exist!
    // Like this, you can change the value with text that will be displayed in the UI!
    if (!existsSync(join(enumsModuleFolder, '_enums', 'ui', 'lists', `${keyWOEnum}List.ts`))) {
      write(join(enumsModuleFolder, '_enums', 'ui', 'lists', `${keyWOEnum}List.ts`), enumFileData)
    }
  }

  // Index
  const enumFileData = []
  enumFileData.push(`import { createModule } from 'graphql-modules';`)
  enumFileData.push(`import { typeDefs } from './${moduleOutputFolder}/typedefs';`)
  enumFileData.push(``)
  enumFileData.push(`export const _enumsModule = createModule({`)
  enumFileData.push(`\tid: 'enums-module',`)
  enumFileData.push(`\ttypeDefs`)
  enumFileData.push(`});`)
  enumFileData.push(``)

  write(join(enumsModuleFolder, '_enums', 'index.ts'), enumFileData)

  const enumsKeys = Object.keys(enums).map(key => {
    return key
  })
  return enumsKeys
}
