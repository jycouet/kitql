import { parse, walk } from '@kitql/internals'

export type WarningThrow = {
	relativePathFile: string
	pathFile: string
	position: {
		line: number
		column: number
	}
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

		// Helper function to calculate line and column from character position
		function getLineAndColumn(position: number): { line: number; column: number } {
			const textBeforePosition = code.substring(0, position)
			const lines = textBeforePosition.split('\n')
			return {
				line: lines.length,
				column: lines[lines.length - 1].length + 1,
			}
		}

		walk(ast, {
			enter(node) {
				if (node.type === 'ThrowStatement') {
					if (log_on_throw_is_not_a_new_class) {
						const thrownExpr = node.argument
						// Check if thrownExpr is not a class
						if (thrownExpr && thrownExpr.type !== 'NewExpression') {
							const position = getLineAndColumn(node.start)
							list.push({
								relativePathFile: pathFile.replace(prjPath, ''),
								pathFile,
								position,
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
