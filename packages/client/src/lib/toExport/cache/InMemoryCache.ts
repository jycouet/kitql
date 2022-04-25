import { stry } from '@kitql/helper';
import type { ICacheData } from './ICacheData';
import type { ResponseResult } from '../kitQLClient';

export class InMemoryCache implements ICacheData {
	private cacheIndexes = {};
	private cacheData = {};

	set(operationKey: string, data: ResponseResult<any, any>) {
		const v = stry(data.variables, 0);
		const fullKey = stry({ k: operationKey, v }, 0);

		// Indexes
		if (this.cacheIndexes[operationKey] !== undefined) {
			if (this.cacheData[fullKey] === undefined) {
				this.cacheIndexes[operationKey].push(v);
			}
		} else {
			this.cacheIndexes[operationKey] = [v];
		}

		// Data
		this.cacheData[fullKey] = data;
	}

	get(operationKey: string, variables: {} | null = null): ResponseResult<any, any> {
		// Data
		const v = stry(variables, 0);
		const fullKey = stry({ k: operationKey, v }, 0);
		return this.cacheData[fullKey];
	}

	remove(operationKey: string, variables: {} | null = null, allOperationKey = true) {
		let nbDeleted = 0;
		if (this.cacheIndexes[operationKey] !== undefined) {
			if (allOperationKey) {
				const keys = this.cacheIndexes[operationKey] as any[];
				for (let i = 0; i < keys.length; i++) {
					const v = keys[i];
					const fullKey = stry({ k: operationKey, v }, 0);
					delete this.cacheData[fullKey];
					nbDeleted++;
				}
				delete this.cacheIndexes[operationKey];
			} else {
				const v = stry(variables, 0);
				const fullKey = stry({ k: operationKey, v }, 0);
				if (this.cacheData[fullKey] !== undefined) {
					delete this.cacheData[fullKey];
					this.cacheIndexes[operationKey] = this.cacheIndexes[operationKey].filter(
						(c: string) => c !== v
					);
					nbDeleted = 1;
				}
			}
		}
		return nbDeleted;
	}
}
