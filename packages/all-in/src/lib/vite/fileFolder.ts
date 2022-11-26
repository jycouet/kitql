import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'
// @ts-ignore
import glob from 'glob'

const rootPath = process.cwd()

export const getDirectories = (source: string) => {
  const directories: string[] = glob
    .sync(source)
    .flat()
    .filter((path: string) => !extname(path))
  return directories
}

export function getFiles(source: string) {
  if (existsSync(source)) {
    return readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
  }
  return []
}

export function getFileWOTS(str: string) {
  return str.replace('.ts', '')
}

export function getFileWODots(str: string) {
  return getFileWOTS(str).replace('.', '')
}

export function createFolderIfNotExists(folder: string) {
  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true })
  }
}

export function getFullPath(folder: string) {
  if (folder.startsWith('/')) {
    return folder
  }
  return join(rootPath, folder)
}
