import { parseTs, prettyPrint, visit } from '@kitql/internals'

export const transformDecorator = async (code: string, decorators_to_strip: string[]) => {
	try {
		const program = parseTs(code)

		let currentClassName = '' // Variable to hold the current class name
		const decorators_wrapped: { decorator: string; functionName: string; className: string }[] = []

		// Wrap functions with one of the decorators in if(import.meta.env.SSR) condition
		visit(program, {
			visitClassDeclaration(path: any) {
				// @ts-ignore
				currentClassName = path.node.id.name
				this.traverse(path)
			},
			visitFunction(path: any) {
				// @ts-ignore
				const decorators: any[] = path.node.decorators || []
				let foundDecorator = false

				let functionName: string
				// Check if the function is a standalone function or a method in a class
				if (path.node.id && path.node.id.name) {
					// Standalone function
					functionName = typeof path.node.id.name === 'string' ? path.node.id.name : 'IdentifierKind'
					// @ts-ignore
				} else if (path.node.key && path.node.key.name) {
					// @ts-ignore
					functionName = path.node.key.name
				}

				// Check if any of the decorators match our list
				decorators.forEach((decorator) => {
					if (
						decorator.expression.callee &&
						decorators_to_strip.includes(decorator.expression.callee.name)
					) {
						foundDecorator = true

						// Push both the decorator name and the associated function name
						decorators_wrapped.push({
							className: currentClassName,
							decorator: decorator.expression.callee.name,
							functionName: functionName ?? '???',
						})
					}
				})

				// If one of the decorators was found, wrap the function body in if(import.meta.env.SSR)
				if (foundDecorator && path.node.body && path.node.body.body) {
					const originalBody = path.node.body.body

					// Create the if statement wrapping the original body
					path.node.body.body = [
						{
							type: 'IfStatement',
							test: {
								type: 'MemberExpression',
								object: {
									type: 'MemberExpression',
									object: {
										type: 'MetaProperty',
										meta: { type: 'Identifier', name: 'import' },
										property: { type: 'Identifier', name: 'meta' },
									},
									property: { type: 'Identifier', name: 'env' },
								},
								property: { type: 'Identifier', name: 'SSR' },
							},
							consequent: {
								type: 'BlockStatement',
								body: originalBody,
							},
							alternate: null,
						},
					]
				}

				this.traverse(path)
			},
		})

		const res = prettyPrint(program, {})
		const info = decorators_wrapped.map(
			(decorator) =>
				`Wrapped with if(import.meta.env.SSR): ${JSON.stringify(Object.values(decorator))}`,
		)

		return { ...res, info }
	} catch (error) {
		// if anything happens, just return the original code
		console.error('Error in transformDecorator2:', error)
		return { code, info: [] }
	}
}
