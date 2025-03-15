import type { ParseResult } from 'oxc-parser'
import { walk } from 'oxc-walker'

import { parse, type ParseOptions } from './ast.js'

export type ImportInfo = {
	name: string
	type: 'default' | 'namespace' | 'named' | 'type'
	localName?: string
	source: string
}

export type UserInfo = {
	used: boolean
}

export const imports = (
	sourceText_or_ast: string | ParseResult,
	opts?: ParseOptions,
): { ast: ReturnType<typeof parse>; importsList: ImportInfo[] } => {
	const ast =
		typeof sourceText_or_ast === 'string' ? parse(sourceText_or_ast, opts) : sourceText_or_ast
	const importsList: ImportInfo[] = []

	walk(ast.program, {
		enter(node) {
			if (node.type === 'ImportDeclaration') {
				const source = node.source.value as string
				const isTypeOnly = node.importKind === 'type'

				// Handle bare imports (import "source")
				if (!node.specifiers || node.specifiers.length === 0) {
					importsList.push({
						name: 'default',
						type: 'default',
						source,
					})
					return false
				}

				// Process all specifiers in this import declaration
				node.specifiers?.forEach((specifier: any) => {
					if (specifier.type === 'ImportDefaultSpecifier') {
						// Default import: import Name from 'source'
						importsList.push({
							name: specifier.local.name,
							type: 'default',
							source,
						})
					} else if (specifier.type === 'ImportNamespaceSpecifier') {
						// Namespace import: import * as Name from 'source'
						importsList.push({
							name: specifier.local.name,
							type: 'namespace',
							source,
						})
					} else if (specifier.type === 'ImportSpecifier') {
						// Named import: import { name } from 'source'
						// or type import: import type { name } from 'source'
						const importedName = specifier.imported?.name || specifier.local.name
						const localName = specifier.local.name

						// Handle type imports
						const importType = isTypeOnly || specifier.importKind === 'type' ? 'type' : 'named'

						importsList.push({
							name: importedName,
							type: importType,
							localName: importedName !== localName ? localName : undefined,
							source,
						})
					}
				})

				return false
			}
		},
	})

	return { ast, importsList }
}
