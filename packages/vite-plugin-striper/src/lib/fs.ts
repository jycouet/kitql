import { lstatSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export function getFilesUnder(rootFolder: string): string[] {
  const files: string[] = []

  function readDirectory(directory: string) {
    const list = readdirSync(directory)
    for (const item of list) {
      const absolutePath = join(directory, item)
      if (lstatSync(absolutePath).isDirectory()) {
        readDirectory(absolutePath)
      } else {
        files.push(absolutePath)
      }
    }
  }

  readDirectory(rootFolder)
  return files
}
