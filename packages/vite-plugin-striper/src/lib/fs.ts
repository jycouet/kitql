// MAIN SOURCE is from ./packages/vite-plugin-kit-routes/src/lib/fs.ts
// Maybe I should put it in a helper something?
import { readdirSync } from 'fs'
import { join, relative } from 'path'

export function getFilesUnder(rootFolder: string) {
  const files: string[] = []

  function traverseDirectory(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        traverseDirectory(fullPath)
      } else {
        const relativePath = relative(rootFolder, fullPath)
        files.push(relativePath)
      }
    }
  }

  traverseDirectory(rootFolder)
  return files
}
