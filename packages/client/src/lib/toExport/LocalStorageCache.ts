import { stry } from '@kitql/helper';
import type { CacheData } from './Interfaces';
import type { ResponseResult } from './kitQLClient';

export class LocalStorageCache implements CacheData {

	set(operationKey: string, data: ResponseResult<any, any>) {
		const v = stry(data.variables, 0);
		const fullKey = JSON.stringify({ k: operationKey, v });

		// Data
		window.localStorage.setItem(fullKey, JSON.stringify(data));
	}

	get(operationKey: string, variables: {} | null = null): ResponseResult<any, any> {
		//Data
		const v = stry(variables, 0);
		const fullKey = stry({ k: operationKey, v }, 0);
		const data = window.localStorage.getItem(fullKey)
		if (!data) return undefined
		return JSON.parse(data);
	}

	remove(operationKey: string, variables: {} | null = null, allOperationKey = true) {
		const v = stry(variables, 0);
		const fullKey = stry({ k: operationKey, v }, 0);
		window.localStorage.removeItem(fullKey)
		return 1;
	}
}
