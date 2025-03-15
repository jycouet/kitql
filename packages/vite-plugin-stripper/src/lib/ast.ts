import { parseTs, visit } from '@kitql/internals'

export type ImportInfo = {
	name: string
	type: 'default' | 'namespace' | 'named' | 'type'
	localName?: string
	source: string
}

export type UserInfo = {
	used: boolean
}

export const imports = (
	code_or_program: string | ReturnType<typeof parseTs>,
): { program: ReturnType<typeof parseTs>; importsList: ImportInfo[] } => {
	const program = typeof code_or_program === 'string' ? parseTs(code_or_program) : code_or_program
	const importsList: ImportInfo[] = []

	visit(program, {
		visitImportDeclaration(path: any) {
			const source = path.node.source.value as string
			const isTypeOnly = path.node.importKind === 'type'

			// Handle bare imports (import "source")
			if (!path.node.specifiers || path.node.specifiers.length === 0) {
				importsList.push({
					name: 'default',
					type: 'default',
					source,
				})
				return false
			}

			// Process all specifiers in this import declaration
			path.node.specifiers?.forEach((specifier: any) => {
				if (specifier.type === 'ImportDefaultSpecifier') {
					// Default import: import Name from 'source'
					importsList.push({
						name: specifier.local.name,
						type: 'default',
						source,
					})
				} else if (specifier.type === 'ImportNamespaceSpecifier') {
					// Namespace import: import * as Name from 'source'
					importsList.push({
						name: specifier.local.name,
						type: 'namespace',
						source,
					})
				} else if (specifier.type === 'ImportSpecifier') {
					// Named import: import { name } from 'source'
					// or type import: import type { name } from 'source'
					const importedName = specifier.imported?.name || specifier.local.name
					const localName = specifier.local.name

					// Handle type imports
					const importType = isTypeOnly || specifier.importKind === 'type' ? 'type' : 'named'

					importsList.push({
						name: importedName,
						type: importType,
						localName: importedName !== localName ? localName : undefined,
						source,
					})
				}
			})

			return false
		},
	})

	return { program, importsList }
}

export const usage = (
	code_or_program: string | ReturnType<typeof parseTs>,
	importsList: ImportInfo[],
): { program: ReturnType<typeof parseTs>; importsList: ImportInfo[] } => {
	const program = typeof code_or_program === 'string' ? parseTs(code_or_program) : code_or_program
	if (importsList.length === 0) return { program, importsList: [] }

	const usageList: (ImportInfo & UserInfo)[] = []

	return { program, importsList: [] }
}
