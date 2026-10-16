import { statSync } from 'node:fs'
import { resolve } from 'node:path'

export const findFileOrUp = (
	/** @type {string | string[]} */ fileNames,
	/** @type {{absolute?: boolean}} */ options = { absolute: false },
) => {
	const names = Array.isArray(fileNames) ? fileNames : [fileNames]
	// Find file recursively 4 levels max up, the nearest level wins, then the order of names
	for (let i = 0; i < 4; i++) {
		for (const fileName of names) {
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
	}

	console.error(`"${names.join('" or "')}" not found`)
	return null
}
