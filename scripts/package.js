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
