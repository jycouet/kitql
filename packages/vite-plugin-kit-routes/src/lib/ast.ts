import { cyan, red, yellow } from '@kitql/helpers'
import { parse, read, walk } from '@kitql/internals'

import { log, routes_path } from './plugin.js'

export const getMethodsOfServerFiles = (pathFile: string) => {
	const fullPath = `${routes_path()}${pathFile}/${'+server.ts'}`
	const code = read(fullPath)

	const exportedNames: string[] = []
	try {
		const codeParsed = parse(code)
		walk(codeParsed.program, {
			enter(node) {
				if (node.type === 'ExportNamedDeclaration') {
					const declaration = node.declaration

					// Check for variable declarations
					if (declaration?.type === 'VariableDeclaration') {
						declaration.declarations.forEach((declaration) => {
							if (
								declaration.type === 'VariableDeclarator' &&
								declaration.id.type === 'Identifier' &&
								declaration.id.name
							) {
								exportedNames.push(declaration.id.name)
							}
						})
					}

					// Check for function declarations
					if (declaration?.type === 'FunctionDeclaration') {
						if (declaration.id && declaration.id.name && !String(declaration.id.name).startsWith('_')) {
							exportedNames.push(String(declaration.id.name))
						}
					}

					// Check for export specifiers (for aliased exports)
					const specifiers = node.specifiers
					if (specifiers) {
						specifiers.forEach((specifier) => {
							if (specifier.exported.type === 'Identifier' && specifier.exported.name) {
								exportedNames.push(String(specifier.exported.name))
							}
						})
					}

					return false
				}
			},
		})
	} catch (error) {
		formatError(error, fullPath)
	}

	return exportedNames
}

export const getActionsOfServerPages = (pathFile: string) => {
	const pathToFile = `${pathFile}/+page.server.ts`
	const fullPath = `${routes_path()}${pathFile}/${'+page.server.ts'}`
	const code = read(fullPath)

	let withLoad = false

	let actions: string[] = []
	try {
		const codeParsed = parse(code)
		walk(codeParsed.program, {
			enter(node) {
				if (node.type === 'ExportNamedDeclaration') {
					// @ts-expect-error
					const declarations = node.declaration?.declarations
					if (declarations) {
						declarations.forEach((declaration: any) => {
							if (declaration.id.name === 'actions') {
								const properties =
									// if } satisfies Actions
									declaration.init.expression?.properties ??
									// if no satisfies Actions
									declaration.init.properties

								if (properties) {
									properties.forEach((property: any) => {
										if (property.key.name) {
											actions.push(property.key.name)
										} else if (property.key.value) {
											actions.push(property.key.value)
										}
									})
								}
							}
							if (declaration.id.name === 'load') {
								withLoad = true
							}
						})
					}
					return false
				}
			},
		})

		if (actions.length > 1 && actions.includes('default')) {
			// Let's remove the default action form our list, and say something
			actions = actions.filter((c) => c !== 'default')
			log.error(
				`In file: ${yellow(pathToFile)}` +
					`\n\t      When using named actions (${yellow(actions.join(', '))})` +
					`, the ${red('default')} action cannot be used. ` +
					`\n\t      See the docs for more info: ` +
					`${cyan(`https://kit.svelte.dev/docs/form-actions#named-actions`)}`,
			)
		}
	} catch (error) {
		formatError(error, fullPath)
	}

	// TODO: withLoad to be used one day? with PAGE_SERVER_LOAD? PAGE_LOAD?
	return { actions, withLoad }
}

export function evaluateNode(node: any): any {
	if (node.type === 'Literal') {
		return node.value
	} else if (node.type === 'StringLiteral') {
		return node.value
	} else if (node.type === 'BooleanLiteral') {
		return node.value
	} else if (node.type === 'NumericLiteral') {
		return node.value
	} else if (node.type === 'NullLiteral') {
		return node.value
	} else if (node.type === 'ObjectExpression') {
		const result: any = {}
		node.properties.forEach((prop: any) => {
			if (prop.type === 'ObjectProperty') {
				const key =
					prop.key.type === 'Identifier'
						? prop.key.name
						: prop.key.type === 'StringLiteral'
							? prop.key.value
							: prop.key.type === 'NumericLiteral'
								? prop.key.value
								: prop.key.value
				result[key] = evaluateNode(prop.value)
			}
		})
		return result
	} else if (node.type === 'ArrayExpression') {
		return node.elements.map((element: any) => evaluateNode(element))
	} else if (node.type === 'Identifier') {
		return node.name
	} else if (node.type === 'TemplateLiteral') {
		return node.quasis.map((quasi: any) => quasi.value.raw).join('')
	} else if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
		// Return the function as is for now
		return node
	} else if (node.type === 'CallExpression') {
		return {
			callee: evaluateNode(node.callee),
			arguments: node.arguments.map((arg: any) => evaluateNode(arg)),
		}
	} else if (node.type === 'MemberExpression') {
		return {
			object: evaluateNode(node.object),
			property: evaluateNode(node.property),
			computed: node.computed,
		}
	} else if (node.type === 'BinaryExpression') {
		return {
			operator: node.operator,
			left: evaluateNode(node.left),
			right: evaluateNode(node.right),
		}
	} else if (node.type === 'ConditionalExpression') {
		return {
			test: evaluateNode(node.test),
			consequent: evaluateNode(node.consequent),
			alternate: evaluateNode(node.alternate),
		}
	} else if (node.type === 'LogicalExpression') {
		return {
			operator: node.operator,
			left: evaluateNode(node.left),
			right: evaluateNode(node.right),
		}
	} else if (node.type === 'UnaryExpression') {
		return {
			operator: node.operator,
			argument: evaluateNode(node.argument),
		}
	} else if (node.type === 'UpdateExpression') {
		return {
			operator: node.operator,
			argument: evaluateNode(node.argument),
			prefix: node.prefix,
		}
	} else if (node.type === 'AssignmentExpression') {
		return {
			operator: node.operator,
			left: evaluateNode(node.left),
			right: evaluateNode(node.right),
		}
	} else if (node.type === 'SequenceExpression') {
		return node.expressions.map((expr: any) => evaluateNode(expr))
	} else if (node.type === 'SpreadElement') {
		return {
			...evaluateNode(node.argument),
		}
	} else if (node.type === 'NewExpression') {
		return {
			callee: evaluateNode(node.callee),
			arguments: node.arguments.map((arg: any) => evaluateNode(arg)),
		}
	} else if (node.type === 'YieldExpression') {
		return {
			argument: node.argument ? evaluateNode(node.argument) : undefined,
			delegate: node.delegate,
		}
	} else if (node.type === 'AwaitExpression') {
		return {
			argument: evaluateNode(node.argument),
		}
	} else if (node.type === 'TaggedTemplateExpression') {
		return {
			tag: evaluateNode(node.tag),
			quasi: evaluateNode(node.quasi),
		}
	} else if (node.type === 'ClassExpression') {
		return {
			id: node.id ? evaluateNode(node.id) : null,
			superClass: node.superClass ? evaluateNode(node.superClass) : null,
			body: evaluateNode(node.body),
		}
	} else if (node.type === 'ClassBody') {
		return node.body.map((method: any) => evaluateNode(method))
	} else if (node.type === 'MethodDefinition') {
		return {
			key: evaluateNode(node.key),
			value: evaluateNode(node.value),
			kind: node.kind,
			static: node.static,
			computed: node.computed,
		}
	} else if (node.type === 'ClassDeclaration') {
		return {
			id: evaluateNode(node.id),
			superClass: node.superClass ? evaluateNode(node.superClass) : null,
			body: evaluateNode(node.body),
		}
	} else if (node.type === 'MetaProperty') {
		return {
			meta: evaluateNode(node.meta),
			property: evaluateNode(node.property),
		}
	} else if (node.type === 'Super') {
		return 'super'
	} else if (node.type === 'Import') {
		return 'import'
	} else if (node.type === 'ThisExpression') {
		return 'this'
	} else {
		log.error('Unknown node type: ' + node.type + ' (fallback to node.value)')
		return node.value
	}
}

export const getExportsFromFile = (code: string, exportName?: string) => {
	try {
		const codeParsed = parse(code)
		let result: any = null

		walk(codeParsed.program, {
			enter(node) {
				if (node.type === 'ExportNamedDeclaration') {
					if (exportName) {
						// Looking for a specific named export
						const specifiers = node.specifiers
						if (specifiers) {
							specifiers.forEach((specifier) => {
								if (
									specifier.exported.type === 'Identifier' &&
									specifier.exported.name === exportName &&
									specifier.local.type === 'Identifier'
								) {
									result = specifier.local.name
								}
							})
						}

						const declaration = node.declaration
						if (declaration?.type === 'VariableDeclaration') {
							declaration.declarations.forEach((declaration) => {
								if (
									declaration.type === 'VariableDeclarator' &&
									declaration.id.type === 'Identifier' &&
									declaration.id.name === exportName
								) {
									result = declaration.init
								}
							})
						}
					}
					return false
				}
				if (node.type === 'ExportDefaultDeclaration') {
					if (!exportName) {
						result = node.declaration
					}
					return false
				}
			},
		})

		return result
	} catch (error) {
		formatError(error, 'config file')
		return null
	}
}

const formatError = (error: unknown, fullPath: string) => {
	if (error instanceof Error) {
		if (error.message.includes('Unexpected token (')) {
			const pos = error.message.split('(')[1].replace(')', '')
			log.error(`Unexpected token: ${yellow(fullPath + ':' + pos)}`)
		} else {
			log.error(`File: ${yellow(fullPath)}
               ${error.message}`)
		}
	}
}
