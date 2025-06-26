import { print as esrap_print } from 'esrap'
import ts from 'esrap/languages/ts'
import { parseSync } from 'oxc-parser'
import type { ParseResult } from 'oxc-parser'
import { walk } from 'oxc-walker'

export { walk }
export type { ParseResult }

export type ParseOptions = { filename?: string; lang?: 'ts' }

export function parse(code_ast: string | ParseResult | null, options?: ParseOptions) {
	if (code_ast === null || typeof code_ast === 'string') {
		const parsed = parseSync(options?.filename ?? 'default.ts', code_ast ?? '', {
			sourceType: 'module',
			lang: options?.lang ?? 'ts',
		})

		return parsed
	}

	return code_ast
}

export function print(ast: ParseResult, options?: {}) {
	try {
		// @ts-expect-error
		return esrap_print(ast.program, ts())
	} catch (error) {
		console.dir(error, { depth: null })
		// console.dir(ast.program, { depth: null })
		throw error
	}
}
