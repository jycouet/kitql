
import { walk } from '../index.js'
import { parse, print } from './ast.js'

export const nullifyImports = async (code: string, packages_to_strip: string[]) => {
	try {
		const ast = parse(code)

		const packages_striped: string[] = []

		walk(ast, {
			enter(node) {
				if (node.type === 'ImportDeclaration') {
					const packageName = node.source.value
					if (packages_to_strip.includes(String(packageName))) {
						const specifiers = node.specifiers!
						const replacementNodes = specifiers
							.map((specifier: any) => {
								if (specifier.type === 'ImportSpecifier') {
									// return builders.variableDeclaration('let', [
									// 	builders.variableDeclarator(
									// 		builders.identifier(String(specifier.imported.name)),
									// 		builders.literal(null),
									// 	),
									// ])
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
				}
			},
		})

		return {
			code: print(ast.program).code,
			info: packages_striped.map((pkg) => `Nullify import from '${pkg}'`),
		}
	} catch (error) {
		return { code, info: [] }
	}
}
