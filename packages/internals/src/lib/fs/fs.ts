import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { dirname, join, posix, relative, resolve } from 'path'

import { Log, red } from '@kitql/helpers'

export function read(pathFile: string) {
	try {
		return readFileSync(pathFile, { encoding: 'utf8' })
	} catch (error) {
		// nothing to do
	}
	return null
}

export function write(pathFile: string, data: string[]) {
	const fullDataToWrite = data.join('\n')

	// createFolderIfNotExists
	mkdirSync(dirname(pathFile), { recursive: true })

	// Don't write if nothing changed!
	if (existsSync(pathFile)) {
		const currentFileData = read(pathFile)
		if (fullDataToWrite === currentFileData) {
			return false
		}
	}
	writeFileSync(join(pathFile), fullDataToWrite)
	return true
}

export function getFilesUnder(rootFolder: string) {
	const files: string[] = []

	function traverseDirectory(dir: string, relDir: string) {
		try {
			const entries = readdirSync(dir, { withFileTypes: true })
				// Listing order is OS-specific (Linux sorts, Windows does not): same output everywhere
				.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))

			for (const entry of entries) {
				// `/` on every OS, like the sort
				const relPath = relDir ? `${relDir}/${entry.name}` : entry.name
				if (entry.isDirectory()) {
					traverseDirectory(join(dir, entry.name), relPath)
				} else {
					files.push(relPath)
				}
			}
		} catch (error) {}
	}

	traverseDirectory(rootFolder, '')
	return files
}

/**
 * Get the relative path of a package, is the package is not found, it will return null
 * @param packageName The name of your package
 * @returns
 */
export function getRelativePackagePath(packageName: string) {
	for (let i = 0; i < 6; i++) {
		// eslint-disable-next-line e18e/prefer-array-fill
		const path = posix.join(...Array.from({ length: i }, () => '..'), 'node_modules', packageName)
		if (existsSync(path)) {
			return path
		}
	}
	return null
}

export { relative, dirname }

export const findFileOrUp = (fileName: string, options?: { absolute: boolean }) => {
	// Find file recursively 4 levels max up
	for (let i = 0; i < 4; i++) {
		try {
			const pathFound = '../'.repeat(i) + fileName
			if (statSync(pathFound)) {
				if (options?.absolute) {
					return resolve(pathFound)
				}
				return pathFound
			}
		} catch (error) {
			// nothing to do
		}
	}

	const log = new Log('kitql-internals')
	log.error(red(`${fileName} not found`))
	return null
}
