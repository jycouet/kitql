import { stringify } from 'safe-stable-stringify';
import type { ResponseResult } from './kitQLClient';

// Next step: IndexedDB?

/**
 * Indexes
 * (KEY1) : [VAR1, VAR2, VAR3]
 *
 * Data
 * (KEY1 : VAR1) : DATA1
 * (KEY1 : VAR2) : DATA2
 * (KEY1 : VAR3) : DATA3
 */

export class CacheData {
	private cacheIndexes = {};
	private cacheData = {};

	set(operationKey: string, data: ResponseResult<any, any>) {
		const v = stringify(data.variables);
		const fullKey = JSON.stringify({ k: operationKey, v });

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
		//Data
		const v = stringify(variables);
		const fullKey = stringify({ k: operationKey, v });
		return this.cacheData[fullKey];
	}

	remove(operationKey: string, variables: {} | null = null, allOperationKey = true) {
		let nbDeleted = 0;
		if (this.cacheIndexes[operationKey] !== undefined) {
			if (allOperationKey) {
				const keys = this.cacheIndexes[operationKey] as any[];
				for (let i = 0; i < keys.length; i++) {
					const v = keys[i];
					const fullKey = stringify({ k: operationKey, v });
					delete this.cacheData[fullKey];
					nbDeleted++;
				}
				delete this.cacheIndexes[operationKey];
			} else {
				const v = stringify(variables);
				const fullKey = stringify({ k: operationKey, v });
				if (this.cacheData[fullKey] !== undefined) {
					delete this.cacheData[fullKey];
					this.cacheIndexes[operationKey] = this.cacheIndexes[operationKey].filter((c) => c !== v);
					nbDeleted = 1;
				}
			}
		}
		return nbDeleted;
	}
}
