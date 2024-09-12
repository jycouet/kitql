import { statSync } from 'fs'
import { resolve } from 'path'

export const findFileOrUp = (fileName, options) => {
  // Find file recursively 4 levels max up
  for (let i = 0; i < 4; i++) {
    try {
      const pathFound = '../'.repeat(i) + fileName
      if (statSync(pathFound)) {
        if (options?.absolute) {
          return resolve(pathFound)
        }
        return pathFound
      }
    } catch (error) {
      // nothing to do
    }
  }

  console.error(`"${fileName}" not found`)
  return null
}
