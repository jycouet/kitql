import { existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'

import { createFolderIfNotExists } from './fileFolder.js'

export function read(pathFile: string): string {
  return readFileSync(pathFile, { encoding: 'utf8' })
}

export function readLines(pathFile: string): string[] {
  return read(pathFile).split('\n')
}

export function write(pathFile: string, data: string | string[]) {
  const fullDataToWrite = Array.isArray(data) ? data.join('\n') : data

  createFolderIfNotExists(dirname(pathFile))

  // Don't write if nothing changed!
  if (existsSync(pathFile)) {
    const currentFileData = read(pathFile)
    if (fullDataToWrite === currentFileData) {
      return
    }
  }

  writeFileSync(join(pathFile), fullDataToWrite)
}
