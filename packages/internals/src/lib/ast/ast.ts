import { print as esrap_print } from 'esrap'
import ts from 'esrap/languages/ts'
import { parseSync } from 'oxc-parser'
import type { ParseResult, Statement } from 'oxc-parser'
import { walk } from 'oxc-walker'

import { oxcCommentsToEsrapComments } from './oxcCommentsToEsrapComments.js'

export { walk }
export type KitQLParseResult = ParseResult & { code: string }
export type ParseOptions = { filename?: string; lang?: 'ts' }
export type { Statement }

export function parse(code_ast: string | null | KitQLParseResult, options?: ParseOptions) {
	if (code_ast === null || typeof code_ast === 'string') {
		const parsed = parseSync(options?.filename ?? 'default.ts', code_ast ?? '', {
			sourceType: 'module',
			lang: options?.lang ?? 'ts',
		})

		return { ...parsed, code: code_ast ?? '' } as KitQLParseResult
	}

	return code_ast
}

export function print(ast: KitQLParseResult, options?: {}) {
	const { ast: ast_with_comments, comments } = oxcCommentsToEsrapComments(
		ast.code,
		// @ts-expect-error
		ast.program,
		ast.comments,
	)

	try {
		return esrap_print(ast_with_comments, ts({ comments }))
	} catch (error) {
		console.dir(error, { depth: null })
		// console.dir(ast.program, { depth: null })
		throw error
	}
}
