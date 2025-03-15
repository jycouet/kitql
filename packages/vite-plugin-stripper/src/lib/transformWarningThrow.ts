import { parse, walk } from '@kitql/internals'

export type WarningThrow = {
	relativePathFile: string
	pathFile: string
	line: number
}

export const transformWarningThrow = async (
	pathFile: string,
	prjPath: string,
	code: string,
	log_on_throw_is_not_a_new_class: boolean,
) => {
	try {
		const ast = parse(code)

		const list: WarningThrow[] = []

		walk(ast, {
			enter(node, parent) {
				if (node.type === 'ThrowStatement') {
					if (log_on_throw_is_not_a_new_class) {
						const thrownExpr = node.argument
						// Check if thrownExpr is not a class
						if (thrownExpr && thrownExpr.type !== 'NewExpression') {
							list.push({
								relativePathFile: pathFile.replace(prjPath, ''),
								pathFile,
								line: node.start ?? 0,
							})
						}
					}
				}
			},
		})

		return { list }
	} catch (error) {
		// if anything happens, just return the original code
		return { list: [] }
	}
}
