import type { ResponseResult } from './kitQLClient';

export interface CacheData {
    set: <DataType, VariablesType>(operationKey: string, data: ResponseResult<DataType, VariablesType>) => void
    get: <DataType, VariablesType>(operationKey: string, variables: {}) => ResponseResult<DataType, VariablesType>
    remove: (operationKey: string, variables: {} | null, allOperationKey: boolean) => number
}