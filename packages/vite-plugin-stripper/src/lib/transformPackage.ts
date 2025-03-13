import { builders, parseTs, prettyPrint, visit } from '@kitql/internals'

// Type definitions for imports
export type ImportInfo = {
	source: string
	specifiers: ImportSpecifierInfo[]
	isTypeOnly: boolean
	originalNode: any
}

export type ImportSpecifierInfo = {
	name: string
	local: string
	isType: boolean
}

export type ImportUsage = {
	inCode: number
	inSSR: number
	inExports: boolean
}

/**
 * Collects all imports from the AST
 */
export const collectImports = (ast: any): ImportInfo[] => {
	const imports: ImportInfo[] = []

	visit(ast, {
		visitImportDeclaration(path: any) {
			const packageName = path.node.source.value
			const isTypeOnly = path.node.importKind === 'type'

			const specifiers =
				path.node.specifiers?.map((specifier: any) => {
					let name, local, isType

					if (specifier.type === 'ImportSpecifier') {
						name = specifier.imported?.name || specifier.local?.name
						local = specifier.local?.name
						isType = specifier.importKind === 'type' || isTypeOnly
					} else if (specifier.type === 'ImportDefaultSpecifier') {
						name = 'default'
						local = specifier.local?.name
						isType = isTypeOnly
					} else if (specifier.type === 'ImportNamespaceSpecifier') {
						name = '*'
						local = specifier.local?.name
						isType = isTypeOnly
					}

					return { name, local, isType }
				}) || []

			imports.push({
				source: packageName,
				specifiers,
				isTypeOnly,
				originalNode: path.node,
			})

			this.traverse(path)
		},
	})

	return imports
}

/**
 * Tracks usage of imports in the code
 */
export const trackImportUsage = (ast: any, imports: ImportInfo[]): Map<string, ImportUsage> => {
	const usageMap = new Map<string, ImportUsage>()

	// Initialize usage tracking for all imports
	imports.forEach((importInfo) => {
		importInfo.specifiers.forEach((specifier) => {
			usageMap.set(specifier.local, { inCode: 0, inSSR: 0, inExports: false })
		})
	})

	// Track exports
	visit(ast, {
		visitExportNamedDeclaration(path: any) {
			if (path.node.specifiers) {
				path.node.specifiers.forEach((specifier: any) => {
					if (specifier.local && usageMap.has(specifier.local.name)) {
						const usage = usageMap.get(specifier.local.name)!
						usage.inExports = true
						usageMap.set(specifier.local.name, usage)
					}
				})
			}

			this.traverse(path)
		},
		visitExportDefaultDeclaration(path: any) {
			if (path.node.declaration && path.node.declaration.type === 'Identifier') {
				const name = path.node.declaration.name
				if (usageMap.has(name)) {
					const usage = usageMap.get(name)!
					usage.inExports = true
					usageMap.set(name, usage)
				}
			}

			this.traverse(path)
		},
	})

	// Track usage in code and SSR blocks
	visit(ast, {
		visitIdentifier(path: any) {
			// Skip identifiers in import/export specifiers
			if (
				path.parentPath.value.type === 'ImportSpecifier' ||
				path.parentPath.value.type === 'ExportSpecifier'
			) {
				return false
			}

			const name = path.node.name
			if (usageMap.has(name)) {
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

				const usage = usageMap.get(name)!
				if (isInSSRBlock) {
					usage.inSSR++
				} else {
					usage.inCode++
				}
				usageMap.set(name, usage)
			}

			this.traverse(path)
		},
	})

	return usageMap
}

/**
 * Helper function to check if a node is the import.meta.env.SSR condition
 */
export const isImportMetaEnvSSR = (node: any): boolean => {
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

/**
 * Nullifies imports from specified packages
 */
export const nullifyImports = async (code: string, to_nullify: string[]) => {
	try {
		const ast = parseTs(code)
		const imports = collectImports(ast)
		const usageMap = trackImportUsage(ast, imports)

		// Debug: Log import usage statistics
		const usageStats: Record<string, any> = {}
		imports.forEach((importInfo) => {
			const source = importInfo.source
			if (!usageStats[source]) {
				usageStats[source] = { specifiers: {} }
			}

			importInfo.specifiers.forEach((specifier) => {
				const usage = usageMap.get(specifier.local)
				usageStats[source].specifiers[specifier.local] = usage
					? { ...usage, shouldPreserve: usage.inExports }
					: { inCode: 0, inSSR: 0, inExports: false, shouldPreserve: false }
			})
		})

		// console.info('Import usage statistics:', JSON.stringify(usageStats, null, 2))

		const packages_striped: string[] = []
		const importsToPreserve = new Map<string, any>() // Map to store imports that need to be preserved
		const importOrder = new Map<string, number>() // Track original import order
		const packageHasNullifiedImports = new Set<string>() // Track which packages have nullified imports

		// Track the original order of imports
		let importIndex = 0
		visit(ast, {
			visitImportDeclaration(path: any) {
				const source = path.node.source.value
				if (!importOrder.has(source)) {
					importOrder.set(source, importIndex++)
				}
				return false
			},
		})

		// First pass: identify imports to preserve and those to nullify
		visit(ast, {
			visitImportDeclaration(path: any) {
				const packageName = path.node.source.value
				if (to_nullify.includes(String(packageName))) {
					let hasExportedSpecifiers = false
					let hasNullifiedSpecifiers = false

					// Check if any specifiers are used in exports
					path.node.specifiers?.forEach((specifier: any) => {
						if (specifier.type === 'ImportSpecifier') {
							const localName = String(specifier.local.name)
							const usage = usageMap.get(localName)

							if (usage && usage.inExports) {
								hasExportedSpecifiers = true

								// Store this import to preserve it
								if (!importsToPreserve.has(packageName)) {
									importsToPreserve.set(packageName, {
										source: packageName,
										specifiers: [],
									})
								}

								importsToPreserve.get(packageName).specifiers.push({
									type: specifier.type,
									imported: specifier.imported,
									local: specifier.local,
								})
							} else {
								hasNullifiedSpecifiers = true
								packageHasNullifiedImports.add(packageName)
							}
						}
					})

					// If we have both exported and nullified specifiers, we'll need to handle this specially
					if (hasExportedSpecifiers && hasNullifiedSpecifiers) {
						// Only add to packages_striped if we actually nullified something
						if (packageHasNullifiedImports.has(packageName)) {
							packages_striped.push(String(packageName))
						}
					}
				}

				return false
			},
		})

		// Remove all imports that will be processed
		const newBody: any[] = []
		ast.body.forEach((node: any) => {
			if (node.type !== 'ImportDeclaration' || !to_nullify.includes(node.source.value)) {
				newBody.push(node)
			}
		})
		ast.body = newBody

		// Create replacement nodes for all imports
		const replacementNodes: any[] = []

		// Add preserved imports first (in their original order)
		const sortedImportsToPreserve = Array.from(importsToPreserve.entries()).sort((a, b) => {
			const orderA = importOrder.get(a[0]) ?? Number.MAX_SAFE_INTEGER
			const orderB = importOrder.get(b[0]) ?? Number.MAX_SAFE_INTEGER
			return orderA - orderB
		})

		for (const [packageName, importInfo] of sortedImportsToPreserve) {
			if (importInfo.specifiers.length > 0) {
				const newImportNode = builders.importDeclaration(
					importInfo.specifiers,
					builders.literal(packageName),
				)
				replacementNodes.push(newImportNode)
			}
		}

		// Add nullified variables
		for (const importInfo of imports) {
			if (to_nullify.includes(importInfo.source)) {
				let hasNullifiedAny = false

				for (const specifier of importInfo.specifiers) {
					const usage = usageMap.get(specifier.local)
					if (!usage || !usage.inExports) {
						replacementNodes.push(
							builders.variableDeclaration('let', [
								builders.variableDeclarator(builders.identifier(specifier.local), builders.literal(null)),
							]),
						)
						hasNullifiedAny = true
					}
				}

				// Add to packages_striped only if we actually nullified something
				if (hasNullifiedAny && !packages_striped.includes(importInfo.source)) {
					packages_striped.push(importInfo.source)
				}
			}
		}

		// Insert all replacement nodes at the beginning of the file
		ast.body.unshift(...replacementNodes)

		return {
			code: prettyPrint(ast).code,
			info: packages_striped.map((pkg) => `Nullify imports from '${pkg}'`),
		}
	} catch (error) {
		console.error('Error in nullifyImports:', error)
		return { code, info: [] }
	}
}
