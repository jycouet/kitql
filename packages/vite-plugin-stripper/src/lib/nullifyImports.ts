import { builders, parse, visit } from '@kitql/internals'
import type { ParseResult } from '@kitql/internals'

export const nullifyImports = async (
	code_ast: string | ParseResult,
	packages_to_strip: string[],
) => {
	try {
		const ast = parse(code_ast)

		const packages_striped: string[] = []

		visit(ast, {
			visitImportDeclaration(path: any) {
				const packageName = path.node.source.value
				if (packages_to_strip.includes(String(packageName))) {
					const specifiers = path.node.specifiers!
					const replacementNodes = specifiers
						.map((specifier: any) => {
							if (specifier.type === 'ImportSpecifier') {
								return builders.variableDeclaration('let', [
									builders.variableDeclarator(
										builders.identifier(String(specifier.imported.name)),
										builders.literal(null),
									),
								])
							}
						})
						.filter(Boolean) // Remove undefined values

					if (replacementNodes.length > 0) {
						path.replace(...replacementNodes)
						packages_striped.push(String(packageName))
					} else {
						path.prune()
					}
				}
				return false
			},
		})

		return {
			code_ast: ast,
			info: packages_striped.map((pkg) => `Nullify import from '${pkg}'`),
		}
	} catch (error) {
		return { code_ast, info: [] }
	}
}
