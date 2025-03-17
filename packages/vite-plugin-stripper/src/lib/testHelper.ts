import type { ParseResult } from '@kitql/internals'
import { print } from '@kitql/internals'

export const toInfoCode = (input: { code_ast: string | ParseResult; info: string[] }) => {
	if (typeof input.code_ast === 'string') {
		return {
			info: input.info,
			code: input.code_ast,
		}
	}
	return {
		info: input.info,
		code: print(input.code_ast!.program).code,
	}
}
