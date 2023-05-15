import fs from 'fs';

// read file into JSON
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// adjust pkg json however you like ...
delete pkg.publishConfig;
delete pkg.bob;
delete pkg.scripts;

pkg.scripts = {};

// write it to your output directory
fs.writeFileSync(
	'./dist/package.json', // path to your output directory may vary
	JSON.stringify(pkg, null, 2)
);

fs.writeFileSync('./dist/README.md', fs.readFileSync('./README.md', 'utf-8'));
