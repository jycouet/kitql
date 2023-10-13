import fs from 'fs';

// read file into JSON
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// adjust pkg json however you like ...
delete pkg.publishConfig;
delete pkg.scripts;

// It's not allowed to have an empty scripts object
pkg.scripts = {
	test: 'echo hello!'
};

// write it to your output directory
fs.writeFileSync(
	'./dist/package.json', // path to your output directory may vary
	JSON.stringify(pkg, null, 2)
);

fs.writeFileSync('./dist/README.md', fs.readFileSync('./README.md', 'utf-8'));
