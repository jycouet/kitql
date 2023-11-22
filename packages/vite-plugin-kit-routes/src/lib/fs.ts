import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export function read(pathFile: string) {
  try {
    return readFileSync(pathFile, { encoding: 'utf8' })
  } catch (error) {}
  return null
}

export function write(pathFile: string, data: string[]) {
  const fullDataToWrite = Array.isArray(data) ? data.join('\n') : data
  createFolderIfNotExists(dirname(pathFile))
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

function createFolderIfNotExists(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}
