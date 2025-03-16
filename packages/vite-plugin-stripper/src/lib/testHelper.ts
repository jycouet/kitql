import type { ParseResult } from "@kitql/internals";
import { print } from "@kitql/internals";

export const toInfoCode = (input: {
	sourceText_or_ast: string | ParseResult;
	ast: ParseResult | null;
	info: string[];
}) => {
	return {
		info: input.info,
		code: print(input.ast!.program).code,
	}
}