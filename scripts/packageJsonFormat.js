import fs from 'fs'
import path from 'path'

// Where are we?
const packageDirPath = process.cwd()

// package.json
const packageJsonPath = path.join(packageDirPath, 'package.json')
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

// rewrite package.json te be in the right order!
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(
    {
      name: pkg.name,
      description: pkg.description ?? 'Missing!!!',
      keywords: pkg.keywords ?? ['Missing!!!'],
      version: pkg.version,
      license: 'MIT',
      type: 'module',
      repository: {
        type: pkg.repository?.type ?? 'git',
        url: pkg.repository?.url ?? 'https://github.com/jycouet/kitql',
        directory: pkg.repository?.directory ?? 'packages/' + pkg.name,
        homepage:
          pkg.repository?.homepage ?? 'https://github.com/jycouet/kitql/tree/main/packages/???',
      },
      scripts: pkg.scripts,
      peerDependencies: pkg.peerDependencies,
      devDependencies: pkg.devDependencies,
      dependencies: pkg.dependencies,
      sideEffects: pkg.sideEffects ?? false, // Key for  tree shaking!
      publishConfig: {
        directory: pkg.publishConfig?.directory ?? 'dist',
        access: pkg.publishConfig?.access ?? 'public',
      },
      files: pkg.files ?? ['dist', '!dist/**/*.test.*', '!dist/**/*.spec.*'],
      svelte: pkg.svelte ?? './esm/index.js',
      types: pkg.types ?? './esm/index.d.ts',
      exports: {
        '.': {
          require: pkg.exports.require ?? './cjs/index.js',
          types: pkg.exports.types ?? './esm/index.d.ts',
          default: pkg.exports.default ?? './esm/index.js',
          svelte: pkg.exports.svelte ?? './esm/index.js',
        },
      },
    },
    null,
    2,
  ),
)
