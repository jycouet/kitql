// import oxc from 'oxc-parser'
// export type ParseOptions = oxc.ParserOptions & { filename?: string }
import type { ParseResult } from 'oxc-parser'
export type ParseOptions = { lang: "ts" }

import * as recast from 'recast';

export function parse(sourceText_or_ast: string | ParseResult, options?: ParseOptions) {
	if (typeof sourceText_or_ast !== 'string') {
		return sourceText_or_ast
	}

	// const lang = options?.lang ?? "ts"
	const result = recast.parse(sourceText_or_ast, {
		parser: require('recast/parsers/typescript'),
		plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
		sourceType: 'module'
	});

	return result as ParseResult

	// const result = oxc.parseSync(options?.filename ?? 'default.ts', sourceText, options)
	// return result
}

export function print(ast: any) {
	return recast.print(ast);
}