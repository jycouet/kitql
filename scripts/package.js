import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { exit } from 'process'
import { buildSync } from 'esbuild'

// Will check the format of package.json
execSync(`node ../../scripts/packageJsonFormat.js`)

// Some constants
const toCopy = ['README.md', 'LICENSE', 'CHANGELOG.md']
const tmpFolder = 'dist-tmp'

// Where are we?
const packageDirPath = process.cwd()

// package.json
const packageJsonPath = path.join(packageDirPath, 'package.json')
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

// replace dep with workspace version
const packagesPath = path.join(packageDirPath, '..')
const packages = fs.readdirSync(packagesPath)
for (let i = 0; i < packages.length; i++) {
  const currentPkg = JSON.parse(
    fs.readFileSync(path.join(packageDirPath, '..', packages[i], 'package.json'), 'utf-8'),
  )
  if (pkg?.dependencies?.[currentPkg.name]) {
    pkg.dependencies[currentPkg.name] = currentPkg.version
  }
}

// adjust pkg json however you like ...
delete pkg.publishConfig
delete pkg.scripts
delete pkg.devDependencies
delete pkg.files

// It's not allowed to have an empty scripts object
pkg.scripts = {
  test: `echo hello ${pkg.name}!`,
}

// let's move dist to another layer of dist!
execSync(`rm -rf ${path.join(packageDirPath, tmpFolder)}`)
fs.mkdirSync(path.join(packageDirPath, tmpFolder))
fs.writeFileSync(path.join(packageDirPath, tmpFolder, 'package.json'), JSON.stringify(pkg, null, 2))
copy(path.join(packageDirPath, 'dist'), path.join(packageDirPath, tmpFolder, 'esm'), {}, [])
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

// now cjs
try {
  let entryPoints = listFiles(`${packageDirPath}/src/lib`).filter((c) => !c.includes('.spec.'))

  buildSync({
    entryPoints,
    format: 'cjs',
    outdir: 'dist/cjs',
  })
} catch (error) {
  console.error(`cjs error`, error)
}
fs.writeFileSync(
  path.join(packageDirPath, 'dist/cjs/package.json'),
  JSON.stringify({ type: 'commonjs' }, null, 2),
)
// cjs end

// remove a few files
const listOfFilesToRemove = [
  // No need these things for kitRoutes
  `${packageDirPath}/src/params/ab.d.ts`,
  `${packageDirPath}/src/test/ROUTES_format-object-path.d.ts`,
  `${packageDirPath}/src/test/ROUTES_format-object-symbol.d.ts`,
  `${packageDirPath}/src/test/ROUTES_format-route-path.d.ts`,
  `${packageDirPath}/src/test/ROUTES_format-route-symbol.d.ts`,
  `${packageDirPath}/src/test/ROUTES_format-variables.d.ts`,

  // no need to publish these
  `${packageDirPath}/dist/cjs/ROUTES.js`,
  `${packageDirPath}/dist/esm/ROUTES.js`,
  `${packageDirPath}/dist/esm/ROUTES.d.ts`,
]

for (let i = 0; i < listOfFilesToRemove.length; i++) {
  const fileToRmv = listOfFilesToRemove[i]
  if (fs.existsSync(fileToRmv)) {
    fs.unlinkSync(fileToRmv)
  }
}

// Check that create template is using latest version
// const createTemplatePath = path.join(packageDirPath, '../create-kitql/templates')
// const templates = fs.readdirSync(createTemplatePath)
// templates.forEach(template => {
//   const pkgTemplatePath = path.join(createTemplatePath, template, 'package.json')
//   const pkgTemplateJson = JSON.parse(fs.readFileSync(pkgTemplatePath, 'utf-8'))
//   if (pkgTemplateJson.dependencies?.[pkg.name]) {
//     pkgTemplateJson.dependencies[pkg.name] = pkg.version
//   }
//   if (pkgTemplateJson.devDependencies?.[pkg.name]) {
//     pkgTemplateJson.devDependencies[pkg.name] = pkg.version
//   }
//   fs.writeFileSync(pkgTemplatePath, JSON.stringify(pkgTemplateJson, null, 2))
// })

console.info(`✅ @kitql scripts/package "${pkg.name}" done`)

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

function listFiles(dir) {
  let files = []

  try {
    const items = fs.readdirSync(dir)

    items.forEach((item) => {
      const fullPath = path.join(dir, item)
      if (fs.statSync(fullPath).isDirectory()) {
        files = files.concat(listFiles(fullPath))
      } else {
        files.push(fullPath)
      }
    })
  } catch (err) {
    console.error('Error reading directory:', err)
  }

  return files
}
