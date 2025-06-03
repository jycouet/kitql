import babel from '@babel/parser'
import * as recast from 'recast'
import { parseSync } from 'oxc-parser'
import type { ParseResult } from 'oxc-parser'
import { write } from '$lib/fs/fs.js'
// import { generate } from 'astring'
export type Statement = recast.types.namedTypes.Statement
export const { visit, builders } = recast.types

// /** @deprecated Use `parse` instead */
// export function parseTs(source: string | null) {
// 	const parsed = babel.parse(source ?? '', {
// 		sourceType: 'module',
// 		plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
// 	})

// 	return parsed.program as ParseResult['program']
// }

export type ParseOptions = { filename?: string, lang?: "ts" }

export function parse(code_ast: string | ParseResult, options?: ParseOptions) {
	if (code_ast === null || typeof code_ast === 'string') {
		const parsed = parseSync(options?.filename ?? 'default.ts', code_ast ?? '', {
			sourceType: 'module',
			lang: options?.lang ?? 'ts'
		})


		const parsed = babel.parse(code_ast ?? '', {
			sourceType: 'module',
			plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
		})


		return parsed
	}

	return code_ast
}

export function print(ast: ParseResult, options?: recast.Options) {
	// return { code: generate(ast.program, { comments: true }) }

	try {
		write('/home/jycouet/udev/gh/lib/kitql/ast.json', [JSON.stringify(ast.program, null, 2)])

		return recast.prettyPrint(ast.program, options)
	} catch (error) {
		console.dir(error, { depth: null })
		// console.dir(ast.program, { depth: null })
		throw error
	}
}
