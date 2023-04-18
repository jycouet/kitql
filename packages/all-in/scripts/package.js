import fs from 'fs'
import path from 'path'

// read file into JSON
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

// adjust pkg json however you like ...
delete pkg.publishConfig
delete pkg.bob
delete pkg.scripts

const pkgHelper = JSON.parse(fs.readFileSync('../../packages/helper/package.json', 'utf-8'))
pkg.dependencies['@kitql/helper'] = pkgHelper.version

const pkgWatchAndRun = JSON.parse(
  fs.readFileSync('../../packages/vite-plugin-watch-and-run/package.json', 'utf-8'),
)
pkg.dependencies['vite-plugin-watch-and-run'] = pkgWatchAndRun.version

deleteFolderSync('./dist/graphql/$kitql')
deleteFileSync('./dist/graphql/kitqlServer.js')
deleteFileSync('./dist/graphql/kitqlServer.d.ts')
deleteFolderSync('./dist/modules')
deleteFolderSync('./dist/prisma')

// write it to your output directory
fs.writeFileSync(
  './dist/package.json', // path to your output directory may vary
  JSON.stringify(pkg, null, 2),
)

/**
 * HELPER FUNCTIONS
 */
function deleteFolderSync(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach(file => {
      const curPath = path.join(folderPath, file)

      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderSync(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })

    fs.rmdirSync(folderPath)
  }
}

function deleteFileSync(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  } else {
    console.log('File does not exist.')
  }
}
