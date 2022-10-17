import * as fs from 'fs'
import * as path from 'path'

export function read(pathFile: string): string {
  return fs.readFileSync(pathFile, { encoding: 'utf8' })
}

export function readLines(pathFile: string): string[] {
  return read(pathFile).split('\n')
}

export function write(pathFile: string, data: string | string[]) {
  const fullDataToWrite = Array.isArray(data) ? data.join('\n') : data

  // Don't write if nothing changed!
  if (fs.existsSync(pathFile)) {
    const currentFileData = read(pathFile)
    if (fullDataToWrite === currentFileData) {
      return
    }
  }

  fs.writeFileSync(path.join(pathFile), fullDataToWrite)
}
