import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { exit } from 'process'

const packageDirPath = process.cwd()
const toCopy = ['README.md', 'LICENSE', 'CHANGELOG.md']
const tmpFolder = 'dist-tmp'

// package.json
const packageJsonPath = path.join(packageDirPath, 'package.json')

// read file into JSON
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

// rewrite package.json te be in the right order!
// fs.writeFileSync(
//   packageJsonPath,
//   JSON.stringify(
//     {
//       name: pkg.name,
//       description: pkg.description ?? 'Missing!!!',
//       version: pkg.version,
//       license: 'MIT',
//       type: 'module',
//       repository: {
//         type: pkg.repository?.type ?? 'git',
//         url: pkg.repository?.url ?? 'https://github.com/jycouet/kitql',
//         directory: pkg.repository?.directory ?? 'packages/' + pkg.name,
//         homepage:
//           pkg.repository?.homepage ?? 'https://github.com/jycouet/kitql/tree/main/packages/???',
//       },
//       scripts: pkg.scripts,
//       peerDependencies: pkg.peerDependencies,
//       devDependencies: pkg.devDependencies,
//       dependencies: pkg.dependencies,
//       publishConfig: {
//         directory: pkg.publishConfig?.directory ?? 'dist',
//         access: pkg.publishConfig?.access ?? 'public',
//       },
//       files: pkg.files ?? ['dist', '!dist/**/*.test.*', '!dist/**/*.spec.*'],
//       svelte: pkg.svelte ?? './dist/index.js',
//       types: pkg.types ?? './dist/index.d.ts',
//       exports: {
//         '.': {
//           types: pkg.types ?? './dist/index.d.ts',
//           svelte: pkg.svelte ?? './dist/index.js',
//         },
//       },
//     },
//     null,
//     2,
//   ),
// )

// adjust pkg json however you like ...
delete pkg.publishConfig
delete pkg.scripts
delete pkg.devDependencies

// It's not allowed to have an empty scripts object
pkg.scripts = {
  test: `echo hello ${pkg.name}!`,
}

// let's move dist to another layer of dist!
execSync(`rm -rf ${path.join(packageDirPath, tmpFolder)}`)
fs.mkdirSync(path.join(packageDirPath, tmpFolder))
fs.writeFileSync(path.join(packageDirPath, tmpFolder, 'package.json'), JSON.stringify(pkg, null, 2))
copy(path.join(packageDirPath, 'dist'), path.join(packageDirPath, tmpFolder, 'dist'), {}, [])
// write it to your output directory
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
  const to = path.join(packageDirPath, tmpFolder, item)
  fs.writeFileSync(to, fs.readFileSync(from, 'utf-8'))
}

execSync(`rm -rf ${path.join(packageDirPath, 'dist')}`)
fs.renameSync(path.join(packageDirPath, tmpFolder), path.join(packageDirPath, 'dist'))

console.log(`✅ @kitql scripts/package "${pkg.name}" done`)

function copy(
  /** @type {string} */ sourceDir,
  /** @type {string} */ destDir,
  /** @type {Record<string, string>} */ transformMap = {},
  /** @type {string[]} */ ignoreList = [],
) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir)
  }

  const files = fs.readdirSync(sourceDir)
  for (const file of files) {
    const sourceFilePath = path.join(sourceDir, file)
    const sourceRelative = path.relative(process.cwd(), sourceFilePath)
    // skip the ignore list
    if (
      !ignoreList.includes(sourceRelative) &&
      !sourceRelative.includes('spec.') &&
      !sourceRelative.includes('test.')
    ) {
      const destFilePath = path.join(destDir, file)

      const stats = fs.statSync(sourceFilePath)

      // files need to be copied and potentially transformed
      if (stats.isFile()) {
        // read the source file
        const source = fs.readFileSync(sourceFilePath)

        // apply any transformations if necessary
        const transformed = Object.entries(transformMap).reduce((prev, [pattern, value]) => {
          return prev.replaceAll(pattern, value)
        }, source.toString())

        // write the result
        fs.writeFileSync(destFilePath, transformed)
      }
      // if we run into a directory then we should keep going
      else if (stats.isDirectory()) {
        copy(sourceFilePath, destFilePath, transformMap, ignoreList)
      }
    }
  }
}
