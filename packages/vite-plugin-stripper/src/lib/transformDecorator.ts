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

		// Check if there are any decorators in the code
		let hasDecorators = false
		visit(program, {
			visitDecorator(path: any) {
				hasDecorators = true
				return false // Stop traversal once we find a decorator
			},
		})

		// If there are no decorators and the code contains exports, just return the original code
		if (!hasDecorators) {
			// Check if the code contains exports
			let hasExports = false
			visit(program, {
				visitExportNamedDeclaration(path: any) {
					hasExports = true
					return false
				},
				visitExportDefaultDeclaration(path: any) {
					hasExports = true
					return false
				},
			})

			if (hasExports) {
				return { code, info: [] }
			}
		}

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

		// If we didn't wrap any decorators, just return the original code
		if (decorators_wrapped.length === 0) {
			return { code, info: [] }
		}

		// Add here the removeUnusedImports
		const unusedImportsResult = await removeUnusedImports(prettyPrint(program, {}).code)

		// Use the code with unused imports removed
		const res = unusedImportsResult

		// Add here the removeSSRedImport
		const ssrImportsResult = await removeSSRedImport(res.code)

		// Use the code with SSR-only imports removed
		const finalRes = ssrImportsResult

		const info = decorators_wrapped
			.map(
				(decorator) =>
					`Wrapped with if(import.meta.env.SSR): ${JSON.stringify(Object.values(decorator))}`,
			)
			.concat(unusedImportsResult.info || [])
			.concat(ssrImportsResult.info || [])

		return { ...finalRes, info }
	} catch (error) {
		// if anything happens, just return the original code
		console.error('Error in transformDecorator:', error)
		return { code, info: [] }
	}
}

const removeUnusedImports = async (code: string) => {
	try {
		const program = parseTs(code)

		const usedIdentifiers = new Set<string>()
		const originalImports = new Map<string, string>()
		const importAliases = new Map<string, string>() // Track aliases: local name -> imported name
		const typeImports = new Set<string>() // Track which imports had the 'type' keyword
		const importOrder = new Map<string, number>() // Track the original order of imports by source
		const exportedIdentifiers = new Set<string>() // Track identifiers that are exported

		// Step 1: Remove all global imports and store them
		const newBody: Statement[] = []
		let importIndex = 0 // Track the order of import sources

		program.body.forEach((node) => {
			if (node.type === 'ImportDeclaration') {
				// Track the order of this import source if we haven't seen it yet
				if (!importOrder.has(node.source.value)) {
					importOrder.set(node.source.value, importIndex++)
				}

				; (node.specifiers ?? []).forEach((specifier) => {
					if (specifier.type === 'ImportSpecifier') {
						const importedName = specifier.imported && specifier.imported.type === 'Identifier'
							? specifier.imported.name
							: null
						const localName = specifier.local?.name

						if (localName) {
							originalImports.set(localName, node.source.value)

							// Track the alias relationship if it exists
							if (importedName && importedName !== localName) {
								importAliases.set(localName, importedName)
							}

							// Check if this is a type import
							if (specifier.importKind === 'type') {
								typeImports.add(localName)
							}
						}
					}
				})
			} else if (node.type === 'ExportNamedDeclaration') {
				// Track exported identifiers
				if (node.specifiers) {
					node.specifiers.forEach((specifier) => {
						if (specifier.type === 'ExportSpecifier' && specifier.local && specifier.local.name) {
							exportedIdentifiers.add(specifier.local.name)
						}
					})
				}
				newBody.push(node)
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

			// Capture identifiers in expressions like console.log('backendPrefilter', remult)
			visitMemberExpression(path: any) {
				if (path.node.object && path.node.object.type === 'Identifier') {
					usedIdentifiers.add(path.node.object.name)
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

		// Add exported identifiers to used identifiers
		exportedIdentifiers.forEach((id) => {
			usedIdentifiers.add(id)
		})

		let removed = Array.from(originalImports)

		// Step 3: Add back necessary imports
		const necessaryImportsBySource = new Map<string, any>()

		usedIdentifiers.forEach((identifier) => {
			if (originalImports.has(identifier)) {
				const source = originalImports.get(identifier)
				if (source) {
					removed = removed.filter(([id, src]) => !(id === identifier && src === source))

					if (!necessaryImportsBySource.has(source)) {
						necessaryImportsBySource.set(source, {
							type: 'ImportDeclaration',
							specifiers: [],
							source: { type: 'StringLiteral', value: source },
						})
					}

					const importDecl = necessaryImportsBySource.get(source)

					// Add the specifier with the correct importKind and handle aliases
					const importedName = importAliases.has(identifier) ? importAliases.get(identifier) : identifier

					importDecl.specifiers.push({
						type: 'ImportSpecifier',
						imported: { type: 'Identifier', name: importedName },
						local: { type: 'Identifier', name: identifier },
						importKind: typeImports.has(identifier) ? 'type' : 'value',
					})
				}
			}
		})

		// Sort imports by their original order
		const sortedImports = Array.from(necessaryImportsBySource.entries())
			.sort((a, b) => {
				const orderA = importOrder.get(a[0]) ?? Number.MAX_SAFE_INTEGER
				const orderB = importOrder.get(b[0]) ?? Number.MAX_SAFE_INTEGER
				return orderA - orderB
			})
			.map(([_, importDecl]) => importDecl)

		// @ts-ignore
		program.body.unshift(...sortedImports)

		return {
			code: prettyPrint(program).code,
			info: removed.map(([id, src]) => `Removed unused import: '${id}' from '${src}'`),
		}
	} catch (error) {
		return { code, info: [] }
	}
}

// Helper function to extract identifiers from an expression
function extractIdentifiersFromExpression(expression: any, identifierSet: Set<string>) {
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
			expression.arguments.forEach((arg: any) => extractIdentifiersFromExpression(arg, identifierSet))
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
				} else if (prop.key && prop.key.type === 'Identifier') {
					// Also capture property keys
					identifierSet.add(prop.key.name)
				}
				if (prop.value) {
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
		case 'ExpressionStatement':
			if (expression.expression) {
				extractIdentifiersFromExpression(expression.expression, identifierSet)
			}
			break
		case 'BinaryExpression':
		case 'LogicalExpression':
			extractIdentifiersFromExpression(expression.left, identifierSet)
			extractIdentifiersFromExpression(expression.right, identifierSet)
			break
		// Add cases for other types as needed
	}
}

const removeSSRedImport = async (code: string) => {
	try {
		const program = parseTs(code)

		// Track identifiers used only in SSR blocks and those used outside SSR blocks
		const ssrOnlyIdentifiers = new Set<string>()
		const nonSsrIdentifiers = new Set<string>()
		const originalImports = new Map<string, string>()
		const importAliases = new Map<string, string>() // Track aliases: local name -> imported name
		const typeImports = new Set<string>() // Track which imports had the 'type' keyword
		const importOrder = new Map<string, number>() // Track the original order of imports by source
		const decoratorImports = new Set<string>() // Track imports used as decorators
		const exportedIdentifiers = new Set<string>() // Track identifiers that are exported

		// Step 1: Collect all imports
		let importIndex = 0 // Track the order of import sources

		program.body.forEach((node) => {
			if (node.type === 'ImportDeclaration') {
				// Track the order of this import source if we haven't seen it yet
				if (!importOrder.has(node.source.value)) {
					importOrder.set(node.source.value, importIndex++)
				}

				; (node.specifiers ?? []).forEach((specifier) => {
					if (specifier.type === 'ImportSpecifier') {
						const importedName = specifier.imported && specifier.imported.type === 'Identifier'
							? specifier.imported.name
							: null
						const localName = specifier.local?.name

						if (localName) {
							originalImports.set(localName, node.source.value)

							// Track the alias relationship if it exists
							if (importedName && importedName !== localName) {
								importAliases.set(localName, importedName)
							}

							// Check if this is a type import
							if (specifier.importKind === 'type') {
								typeImports.add(localName)
							}
						}
					}
				})
			} else if (node.type === 'ExportNamedDeclaration') {
				// Track exported identifiers
				if (node.specifiers) {
					node.specifiers.forEach((specifier) => {
						if (specifier.type === 'ExportSpecifier' && specifier.local && specifier.local.name) {
							exportedIdentifiers.add(specifier.local.name)
						}
					})
				}
			}
		})

		// Add all exported identifiers to nonSsrIdentifiers
		for (const id of exportedIdentifiers) {
			if (originalImports.has(id)) {
				nonSsrIdentifiers.add(id)
			}
		}

		// Step 2: Find all decorators and mark their imports as used outside SSR
		visit(program, {
			visitClassDeclaration(path: any) {
				// Process class decorators
				// @ts-ignore
				; (path.node.decorators || []).forEach((decorator) => {
					collectDecoratorImports(decorator.expression, decoratorImports)
				})

				// Process property and method decorators
				if (path.node.body && path.node.body.body) {
					path.node.body.body.forEach((element: any) => {
						// @ts-ignore
						; (element.decorators || []).forEach((decorator: any) => {
							collectDecoratorImports(decorator.expression, decoratorImports)
						})
					})
				}

				this.traverse(path)
			},
			visitClassMethod(path: any) {
				// Process method decorators
				// @ts-ignore
				; (path.node.decorators || []).forEach((decorator) => {
					collectDecoratorImports(decorator.expression, decoratorImports)
				})

				this.traverse(path)
			},
			visitClassProperty(path: any) {
				// Process property decorators
				// @ts-ignore
				; (path.node.decorators || []).forEach((decorator) => {
					collectDecoratorImports(decorator.expression, decoratorImports)
				})

				this.traverse(path)
			},
		})

		// Add all decorator imports to nonSsrIdentifiers
		for (const id of decoratorImports) {
			if (originalImports.has(id as string)) {
				nonSsrIdentifiers.add(id as string)
			}
		}

		// Step 3: Identify identifiers used in SSR blocks vs outside SSR blocks
		visit(program, {
			visitIfStatement(path: any) {
				// Check if this is an import.meta.env.SSR condition
				const isSSRCondition = isImportMetaEnvSSR(path.node.test)

				if (isSSRCondition && path.node.consequent) {
					// Collect identifiers used only in SSR blocks
					const ssrIdentifiers = new Set()
					visit(path.node.consequent, {
						visitIdentifier(innerPath: any) {
							// Skip import specifiers
							if (innerPath.parentPath.value.type !== 'ImportSpecifier') {
								ssrIdentifiers.add(innerPath.node.name)
							}
							this.traverse(innerPath)
						},
					})

					// Add to SSR-only identifiers
					ssrIdentifiers.forEach((id: any) => {
						if (originalImports.has(id)) {
							ssrOnlyIdentifiers.add(id)
						}
					})
				}

				this.traverse(path)
			},
			visitIdentifier(path: any) {
				// Skip identifiers in import specifiers
				if (path.parentPath.value.type !== 'ImportSpecifier') {
					// Check if this identifier is within an SSR condition
					let isInSSRBlock = false
					let currentPath = path

					while (currentPath.parentPath) {
						if (
							currentPath.parentPath.value.type === 'IfStatement' &&
							isImportMetaEnvSSR(currentPath.parentPath.value.test) &&
							currentPath.name === 'consequent'
						) {
							isInSSRBlock = true
							break
						}
						currentPath = currentPath.parentPath
					}

					// If not in an SSR block, add to non-SSR identifiers
					if (!isInSSRBlock && originalImports.has(path.node.name)) {
						nonSsrIdentifiers.add(path.node.name)
					}
				}

				this.traverse(path)
			},
			// Capture identifiers in expressions like console.log('backendPrefilter', remult)
			visitMemberExpression(path: any) {
				if (path.node.object && path.node.object.type === 'Identifier') {
					const name = path.node.object.name
					if (originalImports.has(name)) {
						// Check if this identifier is within an SSR condition
						let isInSSRBlock = false
						let currentPath = path

						while (currentPath.parentPath) {
							if (
								currentPath.parentPath.value.type === 'IfStatement' &&
								isImportMetaEnvSSR(currentPath.parentPath.value.test) &&
								currentPath.name === 'consequent'
							) {
								isInSSRBlock = true
								break
							}
							currentPath = currentPath.parentPath
						}

						// If not in an SSR block, add to non-SSR identifiers
						if (!isInSSRBlock) {
							nonSsrIdentifiers.add(name)
						}
					}
				}
				this.traverse(path)
			},
		})

		// Step 4: Remove all imports and store them
		const newBody: Statement[] = []
		program.body.forEach((node) => {
			if (node.type !== 'ImportDeclaration') {
				newBody.push(node)
			}
		})
		// @ts-ignore
		program.body = newBody

		// Step 5: Determine which imports to keep (used outside SSR blocks)
		const importsToKeep = new Set([...nonSsrIdentifiers])

		// Step 6: Add back necessary imports (those used outside SSR blocks)
		const necessaryImportsBySource = new Map<string, any>()
		const removed: [string, string][] = []

		originalImports.forEach((source, identifier) => {
			if (importsToKeep.has(identifier) || exportedIdentifiers.has(identifier)) {
				// This import is used outside SSR blocks or is exported, so keep it
				if (!necessaryImportsBySource.has(source)) {
					necessaryImportsBySource.set(source, {
						type: 'ImportDeclaration',
						specifiers: [],
						source: { type: 'StringLiteral', value: source },
					})
				}

				const importDecl = necessaryImportsBySource.get(source)

				// Add the specifier with the correct importKind and handle aliases
				const importedName = importAliases.has(identifier) ? importAliases.get(identifier) : identifier

				importDecl.specifiers.push({
					type: 'ImportSpecifier',
					imported: { type: 'Identifier', name: importedName },
					local: { type: 'Identifier', name: identifier },
					importKind: typeImports.has(identifier) ? 'type' : 'value',
				})
			} else if (ssrOnlyIdentifiers.has(identifier) && !decoratorImports.has(identifier)) {
				// This import is only used in SSR blocks and not as a decorator, so remove it
				removed.push([identifier, source])
			}
		})

		// Sort imports by their original order
		const sortedImports = Array.from(necessaryImportsBySource.entries())
			.sort((a, b) => {
				const orderA = importOrder.get(a[0]) ?? Number.MAX_SAFE_INTEGER
				const orderB = importOrder.get(b[0]) ?? Number.MAX_SAFE_INTEGER
				return orderA - orderB
			})
			.map(([_, importDecl]) => importDecl)

		// @ts-ignore
		program.body.unshift(...sortedImports)

		return {
			code: prettyPrint(program).code,
			info: removed.map(([id, src]) => `Removed SSR-only import: '${id}' from '${src}'`),
		}
	} catch (error) {
		console.error('Error in removeSSRedImport:', error)
		return { code, info: [] }
	}
}

// Helper function to collect imports used in decorators
function collectDecoratorImports(expression: any, importSet: Set<string>) {
	if (!expression) return

	// If it's a direct identifier (like @Entity), add it
	if (expression.type === 'Identifier') {
		importSet.add(expression.name as string)
	}
	// If it's a call expression (like @Entity('users')), add the callee
	else if (expression.type === 'CallExpression') {
		if (expression.callee.type === 'Identifier') {
			importSet.add(expression.callee.name as string)
		} else if (expression.callee.type === 'MemberExpression') {
			// Handle cases like @Fields.uuid()
			collectDecoratorImports(expression.callee, importSet)
		}

		// Also process arguments as they might contain identifiers
		expression.arguments.forEach((arg: any) => {
			if (arg.type === 'ObjectExpression') {
				arg.properties.forEach((prop: any) => {
					if (prop.value && prop.value.type === 'Identifier') {
						importSet.add(prop.value.name as string)
					} else if (prop.value && prop.value.type === 'ArrowFunctionExpression') {
						// Handle function bodies in decorator options
						visit(
							{ type: 'Program', body: [prop.value] },
							{
								visitIdentifier(path: any) {
									if (path.node.name) {
										importSet.add(path.node.name as string)
									}
									this.traverse(path)
								},
							},
						)
					}
				})
			}
		})
	}
	// If it's a member expression (like @Fields.uuid), process both parts
	else if (expression.type === 'MemberExpression') {
		if (expression.object.type === 'Identifier') {
			importSet.add(expression.object.name as string)
		} else {
			collectDecoratorImports(expression.object, importSet)
		}

		if (expression.property.type === 'Identifier') {
			// We don't add the property name as it's not an import
			// But we might need to process it further in some cases
		}
	}
}

// Helper function to check if a node is the import.meta.env.SSR condition
function isImportMetaEnvSSR(node: any): boolean {
	if (!node) return false

	return (
		node.type === 'MemberExpression' &&
		node.object?.type === 'MemberExpression' &&
		node.object?.object?.type === 'MetaProperty' &&
		node.object?.object?.meta?.name === 'import' &&
		node.object?.object?.property?.name === 'meta' &&
		node.object?.property?.name === 'env' &&
		node.property?.name === 'SSR'
	)
}
