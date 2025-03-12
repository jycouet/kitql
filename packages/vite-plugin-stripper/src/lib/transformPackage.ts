import { builders, parseTs, prettyPrint, visit } from '@kitql/internals'

export const nullifyImports = async (code: string, to_nullify: string[]) => {
	try {
		const ast = parseTs(code)

		const packages_striped: string[] = []

		visit(ast, {
			visitImportDeclaration(path: any) {
				const packageName = path.node.source.value
				if (to_nullify.includes(String(packageName))) {
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
			code: prettyPrint(ast).code,
			info: packages_striped.map((pkg) => `Replaced import from '${pkg}'`),
		}
	} catch (error) {
		return { code, info: [] }
	}
}
