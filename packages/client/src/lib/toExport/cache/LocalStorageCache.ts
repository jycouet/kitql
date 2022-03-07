import { stry } from '@kitql/helper';
import type { ICacheData } from './ICacheData';
import type { ResponseResult } from '../kitQLClient';

export class LocalStorageCache implements ICacheData {
	set(operationKey: string, data: ResponseResult<any, any>) {
		const v = stry(data.variables, 0);
		const fullKey = stry({ k: operationKey, v }, 0);
		//INDEXES
		const rawIndexes = window.localStorage.getItem(operationKey)
		if (rawIndexes) {
			const indexes = JSON.parse(rawIndexes) as Array<string>
			if (!window.localStorage.getItem(fullKey)) {
				indexes.push(v)
				//only saves a valid array
				window.localStorage.setItem(operationKey, JSON.stringify(indexes))
			}
		} else {
			window.localStorage.setItem(operationKey, JSON.stringify([v]))
		}
		// Data
		window.localStorage.setItem(fullKey, stry(data, 0));
	}

	get(operationKey: string, variables: {} | null = null): ResponseResult<any, any> {
		//Data
		const v = stry(variables, 0);
		const fullKey = stry({ k: operationKey, v }, 0);
		const data = window.localStorage.getItem(fullKey);
		if (!data) return undefined;
		return JSON.parse(data);
	}

	remove(operationKey: string, variables: {} = null, allOperationKey = true) {
		let nbDeleted = 0
		const rawIndexes = window.localStorage.getItem(operationKey)
		if (rawIndexes) {
			const indexes = JSON.parse(rawIndexes) as Array<string>
			if (allOperationKey) {
				const keysToDelete = indexes.map(v => stry({ k: operationKey, v }, 0))
				nbDeleted = keysToDelete.length
				window.localStorage.removeItem(operationKey)
				keysToDelete.forEach(key => window.localStorage.removeItem(key))
			} else {
				const v = stry(variables, 0);
				const fullKey = stry({ k: operationKey, v }, 0);
				window.localStorage.removeItem(fullKey);
				const newIndexes = indexes.filter(c => c !== v)
				window.localStorage.setItem(operationKey, JSON.stringify(newIndexes))
				nbDeleted = 1
			}
		}
		return nbDeleted;
	}
}
