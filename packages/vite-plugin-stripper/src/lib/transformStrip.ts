// import { parseTs, prettyPrint, visit } from '@kitql/internals'

// Define the type for the decorator config
export type StripConfig = {
	decorator: string
	args_1?: { fn: string; excludeEntityKeys?: string[] }[] // Array of objects with function name and optional entity keys to exclude
}

export const transformStrip = async (code: string, decorators_config: StripConfig[]) => {
	// try {
	// 	const program = parseTs(code)

	// 	let currentClassName = '' // Variable to hold the current class name
	// 	const decorators_wrapped: { decorator: string; functionName: string; className: string }[] = []
	// 	const entityClassesWithSpecialFilters: string[] = [] // Track classes with Entity decorator and special filters
	// 	const entityNameMap = new Map<string, string>() // Map class names to their entity names

	// 	// First pass: identify classes with special decorators and filters
	// 	visit(program, {
	// 		visitClassDeclaration(path: any) {
	// 			// @ts-ignore
	// 			const className = path.node.id.name
	// 			// @ts-ignore
	// 			const decorators: any[] = path.node.decorators || []

	// 			decorators.forEach((decorator) => {
	// 				if (!decorator.expression.callee) return

	// 				const decoratorName = decorator.expression.callee.name
	// 				// Find matching config for this decorator
	// 				const config = decorators_config.find((c) => c.decorator === decoratorName)

	// 				// If this is an Entity-like decorator, store the entity name
	// 				if (config && decorator.expression.arguments && decorator.expression.arguments.length >= 1) {
	// 					const entityNameArg = decorator.expression.arguments[0]
	// 					if (entityNameArg && entityNameArg.value) {
	// 						entityNameMap.set(className, entityNameArg.value)
	// 					}
	// 				}

	// 				if (
	// 					config &&
	// 					config.args_1 &&
	// 					decorator.expression.arguments &&
	// 					decorator.expression.arguments.length >= 2
	// 				) {
	// 					// Check if the second argument (options) has any of the specified function names
	// 					const options = decorator.expression.arguments[1]
	// 					if (options && options.properties) {
	// 						const hasSpecialFilter = options.properties.some((prop: any) =>
	// 							config.args_1?.some((c) => c.fn === prop.key.name),
	// 						)

	// 						if (hasSpecialFilter) {
	// 							entityClassesWithSpecialFilters.push(className)

	// 							// Wrap these special functions in if(import.meta.env.SSR)
	// 							options.properties.forEach((prop: any) => {
	// 								if (config.args_1?.some((c) => c.fn === prop.key.name)) {
	// 									if (prop.value && prop.value.body && prop.value.body.body) {
	// 										const originalBody = prop.value.body.body

	// 										// Find the matching config entry
	// 										const matchingConfig = config.args_1?.find((c) => c.fn === prop.key.name)

	// 										// Get the entity name for this class
	// 										const entityName = entityNameMap.get(className)

	// 										// Check if we need to exclude this entity based on entity name
	// 										const shouldExclude =
	// 											(entityName && matchingConfig?.excludeEntityKeys?.includes(entityName)) || false

	// 										// Only wrap if not excluded
	// 										if (!shouldExclude) {
	// 											// Create the if statement wrapping the original body
	// 											prop.value.body.body = [
	// 												{
	// 													type: 'IfStatement',
	// 													test: {
	// 														type: 'MemberExpression',
	// 														object: {
	// 															type: 'MemberExpression',
	// 															object: {
	// 																type: 'MetaProperty',
	// 																meta: { type: 'Identifier', name: 'import' },
	// 																property: { type: 'Identifier', name: 'meta' },
	// 															},
	// 															property: { type: 'Identifier', name: 'env' },
	// 														},
	// 														property: { type: 'Identifier', name: 'SSR' },
	// 													},
	// 													consequent: {
	// 														type: 'BlockStatement',
	// 														body: originalBody,
	// 													},
	// 													alternate: null,
	// 												},
	// 											]

	// 											// Record that we wrapped this function
	// 											decorators_wrapped.push({
	// 												className,
	// 												decorator: decoratorName,
	// 												functionName: prop.key.name,
	// 											})
	// 										}
	// 									}
	// 								}
	// 							})
	// 						}
	// 					}
	// 				}
	// 			})

	// 			this.traverse(path)
	// 		},
	// 	})

	// 	// Second pass: wrap functions with decorators in if(import.meta.env.SSR) condition
	// 	visit(program, {
	// 		visitClassDeclaration(path: any) {
	// 			// @ts-ignore
	// 			currentClassName = path.node.id.name
	// 			this.traverse(path)
	// 		},
	// 		visitFunction(path: any) {
	// 			// @ts-ignore
	// 			const decorators: any[] = path.node.decorators || []
	// 			let foundDecorator = false
	// 			let decoratorName = ''

	// 			// Initialize functionName with a default value
	// 			let functionName = '???'

	// 			// Check if the function is a standalone function or a method in a class
	// 			if (path.node.id && path.node.id.name) {
	// 				// Standalone function
	// 				functionName = typeof path.node.id.name === 'string' ? path.node.id.name : 'IdentifierKind'
	// 				// @ts-ignore
	// 			} else if (path.node.key && path.node.key.name) {
	// 				// @ts-ignore
	// 				functionName = path.node.key.name
	// 			}

	// 			// Check if any of the decorators match our list
	// 			decorators.forEach((decorator) => {
	// 				if (decorator.expression.callee) {
	// 					const name = decorator.expression.callee.name
	// 					const matchingConfig = decorators_config.find((c) => c.decorator === name)

	// 					if (matchingConfig) {
	// 						foundDecorator = true
	// 						decoratorName = name

	// 						// Push both the decorator name and the associated function name
	// 						decorators_wrapped.push({
	// 							className: currentClassName,
	// 							decorator: name,
	// 							functionName,
	// 						})
	// 					}
	// 				}
	// 			})

	// 			// Check if this function is in a class with special filters and has a special name
	// 			const isInEntityClass = entityClassesWithSpecialFilters.includes(currentClassName)
	// 			const isSpecialFunction =
	// 				functionName &&
	// 				decorators_config.some((config) => config.args_1?.some((c) => functionName.startsWith(c.fn)))

	// 			// Get the entity name for this class
	// 			const entityName = entityNameMap.get(currentClassName)

	// 			// Check if this entity should be excluded
	// 			const shouldExclude =
	// 				entityName &&
	// 				decorators_config.some((config) =>
	// 					config.args_1?.some(
	// 						(c) => functionName.startsWith(c.fn) && c.excludeEntityKeys?.includes(entityName),
	// 					),
	// 				)

	// 			// If one of the decorators was found OR it's a special function in a tracked class, wrap the function body in if(import.meta.env.SSR)
	// 			if (
	// 				(foundDecorator || (isInEntityClass && isSpecialFunction && !shouldExclude)) &&
	// 				path.node.body &&
	// 				path.node.body.body
	// 			) {
	// 				const originalBody = path.node.body.body

	// 				// Create the if statement wrapping the original body
	// 				path.node.body.body = [
	// 					{
	// 						type: 'IfStatement',
	// 						test: {
	// 							type: 'MemberExpression',
	// 							object: {
	// 								type: 'MemberExpression',
	// 								object: {
	// 									type: 'MetaProperty',
	// 									meta: { type: 'Identifier', name: 'import' },
	// 									property: { type: 'Identifier', name: 'meta' },
	// 								},
	// 								property: { type: 'Identifier', name: 'env' },
	// 							},
	// 							property: { type: 'Identifier', name: 'SSR' },
	// 						},
	// 						consequent: {
	// 							type: 'BlockStatement',
	// 							body: originalBody,
	// 						},
	// 						alternate: null,
	// 					},
	// 				]

	// 				// If it's a special function but not already recorded, add it to the list
	// 				if (isInEntityClass && isSpecialFunction && !foundDecorator) {
	// 					// Find the decorator config that has this special function
	// 					const matchingConfig = decorators_config.find((config) =>
	// 						config.args_1?.some((c) => functionName.startsWith(c.fn)),
	// 					)

	// 					// Use the decorator name from the config instead of hardcoding "Entity"
	// 					const decoratorNameFromConfig = matchingConfig ? matchingConfig.decorator : 'Unknown'

	// 					decorators_wrapped.push({
	// 						className: currentClassName,
	// 						decorator: decoratorNameFromConfig,
	// 						functionName,
	// 					})
	// 				}
	// 			}

	// 			this.traverse(path)
	// 		},
	// 	})

	// 	const res = prettyPrint(program, {})
	// 	const info = decorators_wrapped.map(
	// 		(decorator) =>
	// 			`Wrapped with if(import.meta.env.SSR): ${JSON.stringify(Object.values(decorator))}`,
	// 	)

	// 	return { ...res, info }
	// } catch (error) {
	// 	// if anything happens, just return the original code
	// 	console.error('Error in transformDecorator:', error)
	// }
	return { code, info: [] }
}
