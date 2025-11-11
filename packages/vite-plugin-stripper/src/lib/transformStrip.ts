import { parse, walk, type KitQLParseResult, type ParseOptions } from '@kitql/internals'

// Define the type for the decorator config
export type StripConfig = {
	decorator: string
	args_1?: { fn: string; excludeEntityKeys?: string[] }[] // Array of objects with function name and optional entity keys to exclude
}

export const transformStrip = async (
	sourceText_or_ast: string | KitQLParseResult,
	decorators_config: StripConfig[],
	opts?: ParseOptions,
) => {
	try {
		const ast = parse(sourceText_or_ast, opts)
		if (ast.errors.length > 0) {
			return { sourceText_or_ast, ast: null, info: [] }
		}

		let currentClassName = '' // Variable to hold the current class name
		const decorators_wrapped: { decorator: string; functionName: string; className: string }[] = []
		const entityClassesWithSpecialFilters: string[] = [] // Track classes with Entity decorator and special filters
		const entityNameMap = new Map<string, string>() // Map class names to their entity names

		// First pass: identify classes with special decorators and filters
		walk(ast.program, {
			enter(node) {
				if (node.type === 'ClassDeclaration') {
					const className = node.id?.name || ''
					const decorators: any[] = node.decorators || []

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
																		meta: { type: 'Identifier', name: 'import', start: 0, end: 0 },
																		property: { type: 'Identifier', name: 'meta', start: 0, end: 0 },
																		start: 0,
																		end: 0,
																	},
																	property: { type: 'Identifier', name: 'env', start: 0, end: 0 },
																	start: 0,
																	end: 0,
																},
																property: { type: 'Identifier', name: 'SSR', start: 0, end: 0 },
																start: 0,
																end: 0,
															} as any,
															consequent: {
																type: 'BlockStatement',
																body: originalBody,
																start: 0,
																end: 0,
															} as any,
															alternate: null,
															start: 0,
															end: 0,
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
				}
			},
		})

		// Second pass: wrap functions with decorators in if(import.meta.env.SSR) condition
		walk(ast.program, {
			enter(node) {
				if (node.type === 'ClassDeclaration') {
					currentClassName = node.id?.name || ''
				}
				if (node.type === 'MethodDefinition') {
					const decorators: any[] = node.decorators || []
					let foundDecorator = false

					// Initialize functionName with a default value
					let functionName = '???'

					// Check if the method has a name
					if (node.key && node.key.type === 'Identifier') {
						functionName = node.key.name
					}

					// Check if any of the decorators match our list
					decorators.forEach((decorator) => {
						if (decorator.expression.callee) {
							const name = decorator.expression.callee.name
							const matchingConfig = decorators_config.find((c) => c.decorator === name)

							if (matchingConfig) {
								foundDecorator = true

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
						node.value &&
						node.value.body &&
						node.value.body.body
					) {
						const originalBody = node.value.body.body

						// Create the if statement wrapping the original body
						node.value.body.body = [
							{
								type: 'IfStatement',
								test: {
									type: 'MemberExpression',
									object: {
										type: 'MemberExpression',
										object: {
											type: 'MetaProperty',
											meta: { type: 'Identifier', name: 'import', start: 0, end: 0 },
											property: { type: 'Identifier', name: 'meta', start: 0, end: 0 },
											start: 0,
											end: 0,
										},
										property: { type: 'Identifier', name: 'env', start: 0, end: 0 },
										start: 0,
										end: 0,
									},
									property: { type: 'Identifier', name: 'SSR', start: 0, end: 0 },
									start: 0,
									end: 0,
								} as any,
								consequent: {
									type: 'BlockStatement',
									body: originalBody,
									start: 0,
									end: 0,
								} as any,
								alternate: null,
								start: 0,
								end: 0,
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
				}
			},
		})

		const info = decorators_wrapped.map(
			(decorator) =>
				`Wrapped with if(import.meta.env.SSR): ${JSON.stringify(Object.values(decorator))}`,
		)

		return {
			sourceText_or_ast: ast,
			ast,
			info,
		}
	} catch (error) {
		// if anything happens, just return the original code
		console.error('Error in transformDecorator:', error)
	}
	return { sourceText_or_ast, ast: null, info: [] }
}
