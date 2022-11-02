import { join } from 'path'

import { read, write } from './readWrite.js'

export function updateModuleTypes(moduleFolder: string, moduleOutputFolder: string, localDev: boolean) {
  // nothing to do in dev
  if (localDev) {
    return
  }

  const content = read(join(moduleFolder, moduleOutputFolder, 'moduleTypes.ts'))

  const toWrite = content.replaceAll(
    `import type * as gm from "graphql-modules";`,
    `import type { gm } from '@kitql/all-in';`
  )

  write(join(moduleFolder, moduleOutputFolder, 'moduleTypes.ts'), toWrite)
}
