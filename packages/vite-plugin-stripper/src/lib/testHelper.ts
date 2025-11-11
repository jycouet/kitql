import type { KitQLParseResult } from '@kitql/internals'
import { print } from '@kitql/internals'

export const toInfoCode = (input: { code_ast: string | KitQLParseResult; info: string[] }) => {
	if (typeof input.code_ast === 'string') {
		return {
			info: input.info,
			code: input.code_ast,
		}
	}
	const { code } = print(input.code_ast)
	return {
		info: input.info,
		code,
	}
}
