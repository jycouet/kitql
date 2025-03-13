import { parseTs, prettyPrint, visit } from '@kitql/internals'
import type { Statement } from '@kitql/internals'

// Define the type for the decorator config
export type DecoratorConfig = {
	decorator: string
	args_1?: { fn: string; excludeEntityKeys?: string[] }[] // Array of objects with function name and optional entity keys to exclude
}

export const transformDecorator = async (code: string, decorators_config: DecoratorConfig[]) => {
	try {
		const program = parseTs(code)

		let currentClassName = '' // Variable to hold the current class name
		const decorators_wrapped: { decorator: string; functionName: string; className: string }[] = []
		const entityClassesWithSpecialFilters: string[] = [] // Track classes with Entity decorator and special filters
		const entityNameMap = new Map<string, string>() // Map class names to their entity names

		// First pass: identify classes with special decorators and filters
		visit(program, {
			visitClassDeclaration(path: any) {
				// @ts-ignore
				const className = path.node.id.name
				// @ts-ignore
				const decorators: any[] = path.node.decorators || []

				decorators.forEach((decorator) => {
					if (!decorator.expression.callee) return

					const decoratorName = decorator.expression.callee.name
					// Find matching config for this decorator
					const config = decorators_config.find((c) => c.decorator === decoratorName)

					// If this is an Entity-like decorator, store the entity name
					if (config && decorator.expression.arguments && decorator.expression.arguments.length >= 1) {
						const entityNameArg = decorator.expression.arguments[0]
						if (entityNameArg && entityNameArg.value) {
							entityNameMap.set(className, entityNameArg.value)
						}
					}

					if (
						config &&
						config.args_1 &&
						decorator.expression.arguments &&
						decorator.expression.arguments.length >= 2
					) {
						// Check if the second argument (options) has any of the specified function names
						const options = decorator.expression.arguments[1]
						if (options && options.properties) {
							const hasSpecialFilter = options.properties.some((prop: any) =>
								config.args_1?.some((c) => c.fn === prop.key.name),
							)

							if (hasSpecialFilter) {
								entityClassesWithSpecialFilters.push(className)

								// Wrap these special functions in if(import.meta.env.SSR)
								options.properties.forEach((prop: any) => {
									if (config.args_1?.some((c) => c.fn === prop.key.name)) {
										if (prop.value && prop.value.body && prop.value.body.body) {
											const originalBody = prop.value.body.body

											// Find the matching config entry
											const matchingConfig = config.args_1?.find((c) => c.fn === prop.key.name)

											// Get the entity name for this class
											const entityName = entityNameMap.get(className)

											// Check if we need to exclude this entity based on entity name
											const shouldExclude =
												(entityName && matchingConfig?.excludeEntityKeys?.includes(entityName)) || false

											// Only wrap if not excluded
											if (!shouldExclude) {
												// Create the if statement wrapping the original body
												prop.value.body.body = [
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

												// Record that we wrapped this function
												decorators_wrapped.push({
													className,
													decorator: decoratorName,
													functionName: prop.key.name,
												})
											}
										}
									}
								})
							}
						}
					}
				})

				this.traverse(path)
			},
		})

		// Second pass: wrap functions with decorators in if(import.meta.env.SSR) condition
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
				let decoratorName = ''

				// Initialize functionName with a default value
				let functionName = '???'

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
					if (decorator.expression.callee) {
						const name = decorator.expression.callee.name
						const matchingConfig = decorators_config.find((c) => c.decorator === name)

						if (matchingConfig) {
							foundDecorator = true
							decoratorName = name

							// Push both the decorator name and the associated function name
							decorators_wrapped.push({
								className: currentClassName,
								decorator: name,
								functionName,
							})
						}
					}
				})

				// Check if this function is in a class with special filters and has a special name
				const isInEntityClass = entityClassesWithSpecialFilters.includes(currentClassName)
				const isSpecialFunction =
					functionName &&
					decorators_config.some((config) => config.args_1?.some((c) => functionName.startsWith(c.fn)))

				// Get the entity name for this class
				const entityName = entityNameMap.get(currentClassName)

				// Check if this entity should be excluded
				const shouldExclude =
					entityName &&
					decorators_config.some((config) =>
						config.args_1?.some(
							(c) => functionName.startsWith(c.fn) && c.excludeEntityKeys?.includes(entityName),
						),
					)

				// If one of the decorators was found OR it's a special function in a tracked class, wrap the function body in if(import.meta.env.SSR)
				if (
					(foundDecorator || (isInEntityClass && isSpecialFunction && !shouldExclude)) &&
					path.node.body &&
					path.node.body.body
				) {
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

					// If it's a special function but not already recorded, add it to the list
					if (isInEntityClass && isSpecialFunction && !foundDecorator) {
						// Find the decorator config that has this special function
						const matchingConfig = decorators_config.find((config) =>
							config.args_1?.some((c) => functionName.startsWith(c.fn)),
						)

						// Use the decorator name from the config instead of hardcoding "Entity"
						const decoratorNameFromConfig = matchingConfig ? matchingConfig.decorator : 'Unknown'

						decorators_wrapped.push({
							className: currentClassName,
							decorator: decoratorNameFromConfig,
							functionName,
						})
					}
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
		console.error('Error in transformDecorator:', error)
		return { code, info: [] }
	}
}

const removeUnusedImports = async (code: string) => {
	try {
		const program = parseTs(code)

		const usedIdentifiers = new Set()
		const originalImports = new Map()

		// Step 1: Remove all global imports and store them
		const newBody: Statement[] = []
		program.body.forEach((node) => {
			if (node.type === 'ImportDeclaration') {
				; (node.specifiers ?? []).forEach((specifier) => {
					if (specifier.type === 'ImportSpecifier') {
						const name =
							specifier.imported && specifier.imported.type === 'Identifier'
								? specifier.imported.name
								: specifier.local?.name
						if (!originalImports.has(name)) {
							originalImports.set(name, node.source.value)
						}
					}
				})
			} else {
				newBody.push(node)
			}
		})
		// @ts-ignore
		program.body = newBody

		// Step 2: List all identifiers used in the code
		visit(program, {
			visitIdentifier(path: any) {
				// Let's not add identifiers from import specifiers
				if (path.parentPath.value.type !== 'ImportSpecifier') {
					usedIdentifiers.add(path.node.name)
				}

				this.traverse(path)
			},

			visitClassDeclaration(path: any) {
				// Capture identifiers in class decorators
				// @ts-ignore
				; (path.node.decorators || []).forEach((decorator) => {
					extractIdentifiersFromExpression(decorator.expression, usedIdentifiers)
				})

				// Capture identifiers in class methods and properties
				path.node.body.body.forEach((element: any) => {
					if (element.type === 'ClassMethod' || element.type === 'ClassProperty') {
						// Capture identifiers in element decorators
						// @ts-ignore
						; (element.decorators || []).forEach((decorator: any) => {
							extractIdentifiersFromExpression(decorator.expression, usedIdentifiers)
						})
					}
				})

				this.traverse(path)
			},
		})

		let removed = Array.from(originalImports)

		// Step 3: Add back necessary imports
		const necessaryImports: Statement[] = []
		usedIdentifiers.forEach((identifier) => {
			if (originalImports.has(identifier)) {
				const source = originalImports.get(identifier)
				removed = removed.filter(([id, src]) => !(id === identifier && src === source))
				// @ts-ignore
				const found = necessaryImports.find((importDecl) => importDecl.source.value === source)
				if (found) {
					// @ts-ignore
					found.specifiers.push({
						type: 'ImportSpecifier',
						imported: { type: 'Identifier', name: identifier },
						local: { type: 'Identifier', name: identifier },
					})
				} else {
					necessaryImports.push({
						type: 'ImportDeclaration',
						// @ts-ignore
						specifiers: [
							{
								type: 'ImportSpecifier',
								imported: { type: 'Identifier', name: identifier },
								local: { type: 'Identifier', name: identifier },
							},
						],
						source: { type: 'StringLiteral', value: source },
					})
				}
			}
		})

		// @ts-ignore
		program.body.unshift(...necessaryImports)

		return {
			code: prettyPrint(program).code,
			info: removed.map(([id, src]) => `Removed: '${id}' from '${src}'`),
		}
	} catch (error) {
		return { code, info: [] }
	}
}

// Helper function to extract identifiers from an expression
// @ts-ignore
function extractIdentifiersFromExpression(expression: any, identifierSet: Set) {
	if (!expression) return

	switch (expression.type) {
		case 'Identifier':
			identifierSet.add(expression.name)
			break
		case 'MemberExpression':
			extractIdentifiersFromExpression(expression.object, identifierSet)
			extractIdentifiersFromExpression(expression.property, identifierSet)
			break
		case 'CallExpression':
			extractIdentifiersFromExpression(expression.callee, identifierSet)
			expression.arguments.forEach((arg: any) =>
				extractIdentifiersFromExpression(arg, identifierSet),
			)
			break
		case 'ArrayExpression':
			expression.elements.forEach((element: any) =>
				extractIdentifiersFromExpression(element, identifierSet),
			)
			break
		case 'ObjectExpression':
			expression.properties.forEach((prop: any) => {
				if (prop.type === 'SpreadElement') {
					extractIdentifiersFromExpression(prop.argument, identifierSet)
				} else if (prop.value) {
					extractIdentifiersFromExpression(prop.value, identifierSet)
				}
			})
			break
		case 'VariableDeclarator':
			if (expression.id && expression.id.type === 'Identifier') {
				identifierSet.add(expression.id.name)
			}
			if (expression.init) {
				extractIdentifiersFromExpression(expression.init, identifierSet)
			}
			break
		// Add cases for other types as needed
	}
}