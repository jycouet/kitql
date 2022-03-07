import type { ResponseResult } from '../kitQLClient';

/**
 * Indexes
 * (KEY1) : [VAR1, VAR2, VAR3]
 *
 * Data
 * (KEY1 & VAR1) : DATA1
 * (KEY1 & VAR2) : DATA2
 * (KEY1 & VAR3) : DATA3
 */

export interface ICacheData {
	set: <DataType, VariablesType>(
		operationKey: string,
		data: ResponseResult<DataType, VariablesType>
	) => void;
	get: <DataType, VariablesType>(
		operationKey: string,
		variables: {} | null
	) => ResponseResult<DataType, VariablesType>;
	remove: (operationKey: string, variables?: {}, allOperationKey?: boolean) => number;
}
