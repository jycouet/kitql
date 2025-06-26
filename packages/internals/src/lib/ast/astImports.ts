import { parse, walk, type ParseResult } from './ast.js'

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
	code_or_program: string | ParseResult,
): { program: ParseResult; importsList: ImportInfo[] } => {
	const program = parse(code_or_program)
	const importsList: ImportInfo[] = []

	walk(program.program, {
		enter(node) {
			if (node.type === 'ImportDeclaration') {
				const source = node.source.value
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
				node.specifiers?.forEach((specifier) => {
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
						const importedName = specifier.imported.type === 'Identifier' ? specifier.imported.name : specifier.imported.value
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
		// visitImportDeclaration(path: any) {
			
		// },
	})

	return { program, importsList }
}
