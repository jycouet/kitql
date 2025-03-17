import babel from '@babel/parser'
import * as recast from 'recast'

export type Statement = recast.types.namedTypes.Statement
export type ParseResult = babel.ParseResult
export const { visit, builders } = recast.types

/** @deprecated Use `parse` instead */
export function parseTs(source: string | null) {
	const parsed = babel.parse(source ?? '', {
		sourceType: 'module',
		plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
	})

	return parsed.program as ParseResult['program']
}

export function parse(code_ast: string | ParseResult) {
	if (code_ast === null || typeof code_ast === 'string') {
		const parsed = babel.parse(code_ast ?? '', {
			sourceType: 'module',
			plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
		})

		return parsed
	}

	return code_ast
}

export function print(node: recast.types.namedTypes.Program, options?: recast.Options) {
	return recast.prettyPrint(node, options)
}
