import { existsSync, mkdirSync, readdirSync } from 'fs'
import glob from 'glob'
import { extname, join } from 'path'
const rootPath = process.cwd()


export const getDirectories = (source: string) => {
  const directories: string[] =  glob.sync(source)
    .flat()
    .filter((path: string) => !extname(path));
    console.log(source, directories)
  return directories;
}

export function getFiles(source) {
  if (existsSync(source)) {
    return readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
  }
  return []
}

export function getFileWOTS(str) {
  return str.replace('.ts', '')
}

export function getFileWODots(str) {
  return getFileWOTS(str).replace('.', '')
}

export function createFolderIfNotExists(folder) {
  if (!existsSync(folder)) {
    mkdirSync(folder)
  }
}

export function getFullPath(folder) {
  if (folder.startsWith('/')) {
    return folder
  }
  return join(rootPath, folder)
}
