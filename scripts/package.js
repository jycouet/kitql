import fs from 'fs'
import path from 'path'
import { exit } from 'process'

const packageDirPath = process.cwd()
const distFolder = 'dist'
const toCopy = ['README.md', 'LICENSE', 'CHANGELOG.md']

// package.json
const packageJsonPath = path.join(packageDirPath, 'package.json')
const packageJsonDistPath = path.join(packageDirPath, distFolder, 'package.json')

// read file into JSON
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

// adjust pkg json however you like ...
delete pkg.publishConfig
delete pkg.scripts
delete pkg.devDependencies

// It's not allowed to have an empty scripts object
pkg.scripts = {
  test: `echo hello ${pkg.name}!`,
}

// write it to your output directory
fs.writeFileSync(packageJsonDistPath, JSON.stringify(pkg, null, 2))
for (const item of toCopy) {
  let from = path.join(packageDirPath, item)
  // check if we have a global file? (2 levels up)
  if (!fs.existsSync(from)) {
    from = path.join(packageDirPath, '../..', item)
  }
  if (!fs.existsSync(from)) {
    console.error(`File missing: "${from}"`)
    exit(1)
  }
  const to = path.join(packageDirPath, distFolder, item)
  fs.writeFileSync(to, fs.readFileSync(from, 'utf-8'))
}

console.log(`✅ @kitql scripts/package "${pkg.name}" done`)
