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
