import type { ParseResult } from "@kitql/internals";
import { print } from "@kitql/internals";

export const toInfoCode = (input: {
	sourceText_or_ast: string | ParseResult;
	info: string[];
}) => {
	if (typeof input.sourceText_or_ast === 'string') {
		return {
			info: input.info,
			code: input.sourceText_or_ast,
		}
	}
	return {
		info: input.info,
		code: print(input.sourceText_or_ast!.program).code,
	}
}