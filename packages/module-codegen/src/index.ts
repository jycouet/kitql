import YAML from 'yaml';
import path from 'path';
import fs from 'fs';
import { Log, logCyan, logGreen } from '@kitql/helper';
import { TConfigFile, writeDefaultConfigFile } from './defaultConfigFile';
import { read } from './readWrite';

let log = new Log('KitQL module-codegen');

const rootPath = process.cwd();
const configFilePath = path.join(rootPath, '.kitql.yaml');

if (fs.existsSync(configFilePath)) {
	log.info(`${logGreen('✔')} Config file found: ${logGreen(configFilePath)}`);
	const content = read(configFilePath);
	const configFile = YAML.parse(content) as TConfigFile;
	console.log(`configFile`, configFile);
} else {
	writeDefaultConfigFile(configFilePath);
	log.info(`${logGreen('✔')} Config file created: ${logGreen(configFilePath)}`);
}

// console.log(`START`, __dirname, process.cwd());
// const content = fs.readFileSync(path.join(__dirname, '../.kitql.yaml'), { encoding: 'utf8' });

// const configFile = YAML.parse(content);
// log.info('configFile' + JSON.stringify(configFile));
// console.log(`configFile`, configFile);

// console.log(`DONE`);
