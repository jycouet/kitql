import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
delete pkg.devDependencies['eslint-config-kitql']
pkg.dependencies['@kitql/helpers'] = '*'
pkg.dependencies['vite-plugin-watch-and-run'] = '*'
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2))
