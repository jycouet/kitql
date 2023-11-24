import { readdirSync } from 'fs'
import { lstatSync } from 'node:fs'

export function getFilesUnder(rootFolder: string) {
  const files: string[] = []
  let list = readdirSync(rootFolder, { recursive: true }) as string[]
  for (let i = 0; i < list.length; i++) {
    const absolutePath = rootFolder + '/' + list[i]
    if (!lstatSync(absolutePath).isDirectory()) {
      files.push(list[i])
    }
  }
  return files
}
