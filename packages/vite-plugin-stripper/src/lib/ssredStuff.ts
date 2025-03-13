import { parseTs, prettyPrint, visit, builders } from "@kitql/internals";
import { imports, type ImportInfo } from "./ast.js";

export type DecoratorConfig = {
	decorator: string
	args_1?: { fn: string; excludeEntityKeys?: string[] }[] // Array of objects with function name and optional entity keys to exclude
}

export const transformDecorator = async (code: string, decorators_config: DecoratorConfig[]) => {
	try {
		// Parse the TypeScript code
		const program = parseTs(code);

		// Get all imports using the ast utility
		const { importsList } = imports(program);

		// Initialize tracking variables
		const decorators_wrapped: { decorator: string; functionName: string; className: string }[] = [];
		const dynamicImports: { source: string; line: number; globalImport: ImportInfo }[] = [];
		const ssrUsedImports: { source: string; name: string; line: number }[] = [];
		let currentClassName = '';
		let insideSSRBlock = false;

		// Early return check - if no decorators and no exports, just return the original code
		let hasDecorators = false;
		let hasExports = false;

		// Check for decorators
		visit(program, {
			visitDecorator(path: any) {
				hasDecorators = true;
				return false; // Stop traversal once we find a decorator
			}
		});

		// Check for exports
		visit(program, {
			visitExportNamedDeclaration() {
				hasExports = true;
				return false;
			},
			visitExportDefaultDeclaration() {
				hasExports = true;
				return false;
			}
		});

		// If no decorators and has exports, return original code
		if (!hasDecorators && hasExports) {
			return { code, info: [] };
		}

		// TASK 2: Identify dynamic imports that are also imported globally
		visit(program, {
			visitAwaitExpression(path: any) {
				if (path.node.argument?.type === 'CallExpression' &&
					path.node.argument.callee?.type === 'Import') {

					// This is a dynamic import: await import('...')
					const importCall = path.node.argument;
					if (importCall.arguments.length > 0 && importCall.arguments[0].value) {
						const importSource = importCall.arguments[0].value;
						const line = path.node.loc?.start.line || 0;

						// Check if this module is also imported globally
						const matchingGlobalImport = importsList.find((imp: ImportInfo) => imp.source === importSource);

						if (matchingGlobalImport) {
							// Add to our list of dynamic imports with the global import info
							dynamicImports.push({
								source: importSource,
								line,
								globalImport: matchingGlobalImport
							});

							// Create a specific message based on the import type
							let warningMessage = '';
							let replacementSuggestion = '';

							// Create a suggestion based on the actual import
							if (matchingGlobalImport.type === 'default') {
								const name = matchingGlobalImport.localName || matchingGlobalImport.name;
								replacementSuggestion = `const ${name} = await import('${importSource}').then(m => m.default)`;
							} else if (matchingGlobalImport.type === 'namespace') {
								const name = matchingGlobalImport.localName || matchingGlobalImport.name;
								replacementSuggestion = `const ${name} = await import('${importSource}')`;
							} else if (matchingGlobalImport.type === 'named') {
								const name = matchingGlobalImport.name;
								const localName = matchingGlobalImport.localName || name;
								replacementSuggestion = `const { ${name}${name !== localName ? ` as ${localName}` : ''} } = await import('${importSource}')`;
							}

							warningMessage = `Module '${importSource}' is already imported globally. Move the import inside the SSR block: if (import.meta.env.SSR) { ${replacementSuggestion}; }`;

							// Replace with a warning and the import
							path.node.argument = builders.callExpression(
								builders.memberExpression(
									builders.callExpression(
										builders.functionExpression(
											null, // No function name
											[], // No parameters
											builders.blockStatement([
												// Console warning
												builders.expressionStatement(
													builders.callExpression(
														builders.memberExpression(
															builders.identifier('console'),
															builders.identifier('warn')
														),
														[
															builders.literal(warningMessage),
														]
													)
												),
												// Return the import function
												builders.returnStatement(
													builders.identifier('import')
												)
											])
										),
										[]
									),
									builders.identifier('call')
								),
								[
									builders.thisExpression(),
									builders.literal(importSource)
								]
							);
						}
					}
				}

				this.traverse(path);
			},

			// Track when we enter and exit SSR blocks
			visitIfStatement(path: any) {
				// Check if this is an if(import.meta.env.SSR) statement
				const isSSRCheck =
					path.node.test?.type === 'MemberExpression' &&
					path.node.test.object?.type === 'MemberExpression' &&
					path.node.test.object.object?.type === 'MetaProperty' &&
					path.node.test.object.object.meta?.name === 'import' &&
					path.node.test.object.object.property?.name === 'meta' &&
					path.node.test.object.property?.name === 'env' &&
					path.node.test.property?.name === 'SSR';

				if (isSSRCheck) {
					// We're entering an SSR block
					const oldInsideSSRBlock = insideSSRBlock;
					insideSSRBlock = true;

					// Visit the consequent (the block inside the if statement)
					this.traverse(path);

					// Restore the previous state
					insideSSRBlock = oldInsideSSRBlock;
					return false;
				}

				this.traverse(path);
			},

			// Generic tracking of all identifiers used inside SSR blocks
			visitIdentifier(path: any) {
				if (insideSSRBlock) {
					const name = path.node.name;
					const line = path.node.loc?.start.line || 0;

					// Check if this identifier matches any of our global imports
					for (const importInfo of importsList) {
						// Check for named imports
						if (importInfo.type === 'named' &&
							(importInfo.localName === name || importInfo.name === name)) {
							ssrUsedImports.push({
								source: importInfo.source,
								name,
								line
							});
						}
						// Check for default imports
						else if (importInfo.type === 'default' && importInfo.name === name) {
							ssrUsedImports.push({
								source: importInfo.source,
								name,
								line
							});
						}
						// Check for namespace imports
						else if (importInfo.type === 'namespace' && importInfo.name === name) {
							ssrUsedImports.push({
								source: importInfo.source,
								name,
								line
							});
						}
					}
				}

				this.traverse(path);
			},

			// Track member expressions to detect when properties of imported modules are used
			visitMemberExpression(path: any) {
				if (insideSSRBlock && path.node.object?.type === 'Identifier') {
					const objectName = path.node.object.name;
					const propertyName = path.node.property?.name || '';
					const line = path.node.loc?.start.line || 0;

					// Check for member expressions of imported modules (generic approach)
					for (const importInfo of importsList) {
						// Check for namespace imports
						if (importInfo.type === 'namespace' &&
							(importInfo.name === objectName || importInfo.localName === objectName)) {
							ssrUsedImports.push({
								source: importInfo.source,
								name: `${objectName}.${propertyName}`,
								line
							});
						}
						// Check for named imports that might be objects
						else if ((importInfo.type === 'named' || importInfo.type === 'default') &&
							(importInfo.name === objectName || importInfo.localName === objectName)) {
							ssrUsedImports.push({
								source: importInfo.source,
								name: `${objectName}.${propertyName}`,
								line
							});
						}
					}
				}

				this.traverse(path);
			}
		});

		// TASK 1: Wrap decorated methods with if(import.meta.env.SSR)
		// Track class names for context
		visit(program, {
			visitClassDeclaration(path: any) {
				currentClassName = path.node.id?.name || '';
				this.traverse(path);
			},

			// Process methods with decorators
			visitMethod(path: any) {
				// Check for decorators
				const decorators = path.node.decorators || [];
				let foundMatchingDecorator = false;
				let decoratorName = '';

				// Get method name
				const methodName = path.node.key?.name || '???';

				// Check if any decorator matches our config
				decorators.forEach((decorator: any) => {
					if (decorator.expression?.callee?.name) {
						const name = decorator.expression.callee.name;
						const matchingConfig = decorators_config.find(c => c.decorator === name);

						if (matchingConfig) {
							foundMatchingDecorator = true;
							decoratorName = name;

							// Record that we found a matching decorator
							decorators_wrapped.push({
								className: currentClassName,
								decorator: name,
								functionName: methodName
							});
						}
					}
				});

				// If we found a matching decorator and the method has a body, wrap it with if(import.meta.env.SSR)
				if (foundMatchingDecorator && path.node.body?.body) {
					const originalBody = path.node.body.body;

					// Check if the body is already wrapped with if(import.meta.env.SSR)
					const alreadyWrapped = isAlreadyWrappedWithSSRCheck(originalBody);

					// Only wrap if not already wrapped
					if (!alreadyWrapped) {
						// Create the if statement wrapping the original body
						path.node.body.body = [
							createSSRIfStatement(originalBody)
						];
					}
				}

				this.traverse(path);
			},

			// Process static methods with decorators
			visitClassMethod(path: any) {
				// Check for decorators
				const decorators = path.node.decorators || [];
				let foundMatchingDecorator = false;
				let decoratorName = '';

				// Get method name
				const methodName = path.node.key?.name || '???';

				// Check if any decorator matches our config
				decorators.forEach((decorator: any) => {
					if (decorator.expression?.callee?.name) {
						const name = decorator.expression.callee.name;
						const matchingConfig = decorators_config.find(c => c.decorator === name);

						if (matchingConfig) {
							foundMatchingDecorator = true;
							decoratorName = name;

							// Record that we found a matching decorator
							decorators_wrapped.push({
								className: currentClassName,
								decorator: name,
								functionName: methodName
							});
						}
					}
				});

				// If we found a matching decorator and the method has a body, wrap it with if(import.meta.env.SSR)
				if (foundMatchingDecorator && path.node.body?.body) {
					const originalBody = path.node.body.body;

					// Check if the body is already wrapped with if(import.meta.env.SSR)
					const alreadyWrapped = isAlreadyWrappedWithSSRCheck(originalBody);

					// Only wrap if not already wrapped
					if (!alreadyWrapped) {
						// Create the if statement wrapping the original body
						path.node.body.body = [
							createSSRIfStatement(originalBody)
						];
					}
				}

				this.traverse(path);
			}
		});

		// If we didn't make any changes, return the original code
		if (decorators_wrapped.length === 0 && dynamicImports.length === 0 && ssrUsedImports.length === 0) {
			return { code, info: [] };
		}

		// Generate the transformed code
		const finalRes = prettyPrint(program, {});

		// Generate info about the transformations
		const info: string[] = [];

		// Add decorator wrapping info
		decorators_wrapped.forEach(decorator => {
			info.push(`Wrapped with if(import.meta.env.SSR): ${JSON.stringify(Object.values(decorator))}`);
		});

		// Add dynamic import info
		dynamicImports.forEach(importInfo => {
			let replacementSuggestion = '';
			const globalImport = importInfo.globalImport;

			if (globalImport.type === 'default') {
				const name = globalImport.localName || globalImport.name;
				replacementSuggestion = `const ${name} = await import('${importInfo.source}').then(m => m.default)`;
			} else if (globalImport.type === 'namespace') {
				const name = globalImport.localName || globalImport.name;
				replacementSuggestion = `const ${name} = await import('${importInfo.source}')`;
			} else if (globalImport.type === 'named') {
				const name = globalImport.name;
				const localName = globalImport.localName || name;
				replacementSuggestion = `const { ${name}${name !== localName ? ` as ${localName}` : ''} } = await import('${importInfo.source}')`;
			}

			info.push(`Module '${importInfo.source}' is imported both globally and dynamically at line ${importInfo.line}. Use the global import instead.`);
		});

		// Add SSR used imports info
		if (ssrUsedImports.length > 0) {
			// Group by source to provide better suggestions
			const importsBySource = new Map<string, { names: Set<string>, lines: Set<number> }>();

			ssrUsedImports.forEach(imp => {
				if (!importsBySource.has(imp.source)) {
					importsBySource.set(imp.source, { names: new Set(), lines: new Set() });
				}
				const entry = importsBySource.get(imp.source)!;
				entry.names.add(imp.name);
				entry.lines.add(imp.line);
			});

			// Add an info entry for each source
			importsBySource.forEach((data, source) => {
				const names = Array.from(data.names);

				// Special case for perf_hooks performance
				if (source === 'perf_hooks' && names.some(name => name === 'performance' || name.startsWith('performance.'))) {
					info.push("'performance' should not be imported globally, but like: const { performance } = await import('perf_hooks')\" withing the function.");
				} else {
					// Add each usage as a separate info entry
					names.forEach(name => {
						info.push(`Module '${source}' (${name}) is imported globally but used inside an SSR block. Consider moving the import inside the SSR block.`);
					});
				}
			});
		}

		return { code: finalRes, info };
	} catch (error) {
		// If anything goes wrong, return the original code
		console.error('Error in transformDecorator:', error);
		return { code, info: [] };
	}
};

// Helper function to check if code is already wrapped with if(import.meta.env.SSR)
function isAlreadyWrappedWithSSRCheck(body: any[]): boolean {
	return (
		body.length === 1 &&
		body[0].type === 'IfStatement' &&
		body[0].test?.type === 'MemberExpression' &&
		body[0].test.object?.type === 'MemberExpression' &&
		body[0].test.object.object?.type === 'MetaProperty' &&
		body[0].test.object.object.meta?.name === 'import' &&
		body[0].test.object.object.property?.name === 'meta' &&
		body[0].test.object.property?.name === 'env' &&
		body[0].test.property?.name === 'SSR'
	);
}

// Helper function to create an if(import.meta.env.SSR) statement
function createSSRIfStatement(body: any[]): any {
	return {
		type: 'IfStatement',
		test: {
			type: 'MemberExpression',
			object: {
				type: 'MemberExpression',
				object: {
					type: 'MetaProperty',
					meta: { type: 'Identifier', name: 'import' },
					property: { type: 'Identifier', name: 'meta' }
				},
				property: { type: 'Identifier', name: 'env' }
			},
			property: { type: 'Identifier', name: 'SSR' }
		},
		consequent: {
			type: 'BlockStatement',
			body: body
		},
		alternate: null
	};
}