import { readdirSync } from 'fs'
import { existsSync, mkdirSync, readFileSync, writeFileSync, lstatSync } from 'node:fs'
import { dirname, join } from 'node:path'

export function read(pathFile: string) {
  try {
    return readFileSync(pathFile, { encoding: 'utf8' })
  } catch (error) {}
  return null
}

export function write(pathFile: string, data: string[]) {
  const fullDataToWrite = Array.isArray(data) ? data.join('\n') : data

  // createFolderIfNotExists
  mkdirSync(dirname(pathFile), { recursive: true })

  // Don't write if nothing changed!
  if (existsSync(pathFile)) {
    const currentFileData = read(pathFile)
    if (fullDataToWrite === currentFileData) {
      return false
    }
  }
  writeFileSync(join(pathFile), fullDataToWrite)
  return true
}

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
