import { Log } from '@kitql/helper';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';

const rootPath = process.cwd();

export function getDirectories(source) {
	return readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);
}

export function getFiles(source) {
	if (existsSync(source)) {
		return readdirSync(source, { withFileTypes: true })
			.filter(dirent => dirent.isFile())
			.map(dirent => dirent.name);
	}
	return [];
}

export function getFileWOTS(str) {
	return str.replace('.ts', '');
}

export function getFileWODots(str) {
	return getFileWOTS(str).replace('.', '');
}

export function createFolderIfNotExists(folder) {
	if (!existsSync(folder)) {
		mkdirSync(folder);
	}
}

export function getFullPath(folder) {
	if (folder.startsWith('/')) {
		return folder;
	}
	return path.join(rootPath, folder);
}
