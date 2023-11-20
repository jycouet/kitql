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
        type: 'git',
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
        directory: 'dist',
        access: 'public',
      },
      files: ['dist', '!dist/**/*.test.*', '!dist/**/*.spec.*'],
      svelte: './esm/index.js',
      types: './esm/index.d.ts',
      exports: {
        '.': {
          require: './cjs/index.js',
          types: './esm/index.d.ts',
          default: './esm/index.js',
          svelte: './esm/index.js',
        },
      },
    },
    null,
    2,
  ),
)
