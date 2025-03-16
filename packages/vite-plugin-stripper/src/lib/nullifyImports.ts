import { parse, walk } from '@kitql/internals'
import type { Statement, ParseResult, ParseOptions } from '@kitql/internals'

export const nullifyImports = async (sourceText_or_ast: string | ParseResult, packages_to_strip: string[], opts?: ParseOptions) => {
	try {
		const ast =
			typeof sourceText_or_ast === 'string' ? parse(sourceText_or_ast, opts) : sourceText_or_ast

		const nullifyed: string[] = []

		walk(ast, {
			enter(node, parent) {
				if (node.type === 'ImportDeclaration') {
					const packageName = node.source.value
					if (packages_to_strip.includes(String(packageName))) {
						const specifiers = node.specifiers
						const replacementNodes = specifiers
							.map((specifier: any) => {
								if (specifier.type === 'ImportSpecifier') {
									nullifyed.push(
										`Nullify '${String(specifier.imported.name)}' from '${String(packageName)}'`,
									)
									// Create a variable declaration that sets the import to null
									return {
										type: 'VariableDeclaration',
										kind: 'let',
										declarations: [
											{
												type: 'VariableDeclarator',
												id: {
													type: 'Identifier',
													name: String(specifier.imported.name),
												},
												init: {
													type: 'Literal',
													value: null,
												},
											},
										],
									} as Statement
								}
								return null
							})
							.filter((node): node is Statement => node !== null) // Remove null values and assert type

						if (replacementNodes.length > 0) {
							// Replace the node in the parent's body
							if (
								parent &&
								'type' in parent &&
								(parent.type === 'Program' || parent.type === 'BlockStatement') &&
								Array.isArray(parent.body)
							) {
								const index = parent.body.indexOf(node)
								if (index !== -1) {
									// Remove the import declaration
									parent.body.splice(index, 1)
									// Insert the replacement nodes
									parent.body.splice(index, 0, ...replacementNodes)
								}
							}
						} else {
							// Remove the node from the parent's body
							if (
								parent &&
								'type' in parent &&
								(parent.type === 'Program' || parent.type === 'BlockStatement') &&
								Array.isArray(parent.body)
							) {
								const index = parent.body.indexOf(node)
								if (index !== -1) {
									parent.body.splice(index, 1)
								}
							}
						}
					}
					return false
				}
			},
		})

		return {
			sourceText_or_ast: ast,
			info: nullifyed,
		}
	} catch (error) {
		return { sourceText_or_ast, info: [] }
	}
}
