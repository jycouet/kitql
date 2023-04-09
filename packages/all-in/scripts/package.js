import fs from 'fs';

// read file into JSON
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// adjust pkg json however you like ..
delete pkg.devDependencies
delete pkg.bob
delete pkg.scripts

const pkgHelper = JSON.parse(fs.readFileSync('../../packages/helper/package.json', 'utf-8'));
pkg.dependencies["@kitql/helper"] = pkgHelper.version

const pkgWatchAndRun = JSON.parse(fs.readFileSync('../../packages/vite-plugin-watch-and-run/package.json', 'utf-8'));
pkg.dependencies["vite-plugin-watch-and-run"] = pkgWatchAndRun.version

// write it to your output directory
fs.writeFileSync(
  './dist/package.json', // path to your output directory may vary
  JSON.stringify(pkg, null, 2)
);