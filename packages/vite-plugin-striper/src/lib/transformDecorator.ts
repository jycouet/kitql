import { parse } from '@babel/parser'
import * as recast from 'recast'
import { prettyPrint } from 'recast'

const { visit } = recast.types

type Statement = recast.types.namedTypes.Statement

export const removeUnusedImports = async (code: string) => {
  try {
    const ast = parse(code, {
      plugins: ['typescript', 'decorators-legacy', 'importAssertions'],
      sourceType: 'module',
    })

    const usedIdentifiers = new Set()
    const originalImports = new Map()

    // Step 1: Remove all global imports and store them
    let newBody: Statement[] = []
    ast.program.body.forEach(node => {
      if (node.type === 'ImportDeclaration') {
        node.specifiers.forEach(specifier => {
          if (specifier.type === 'ImportSpecifier') {
            const name =
              specifier.imported && specifier.imported.type === 'Identifier'
                ? specifier.imported.name
                : specifier.local.name
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
    ast.program.body = newBody

    // Step 2: List all identifiers used in the code
    visit(ast, {
      visitIdentifier(path) {
        usedIdentifiers.add(path.node.name)
        this.traverse(path)
      },
    })

    let removed = Array.from(originalImports)

    // Step 3: Add back necessary imports
    const necessaryImports: Statement[] = []
    usedIdentifiers.forEach(identifier => {
      if (originalImports.has(identifier)) {
        const source = originalImports.get(identifier)
        removed = removed.filter(([id, src]) => !(id === identifier && src === source))
        // @ts-ignore
        const found = necessaryImports.find(importDecl => importDecl.source.value === source)
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
    ast.program.body.unshift(...necessaryImports)

    return {
      code: recast.print(ast).code,
      info: removed.map(([id, src]) => `Removed: '${id}' from '${src}'`),
    }
  } catch (error) {
    return { code, info: [] }
  }
}

export const transformDecorator = async (code: string, decorators_to_strip: string[]) => {
  try {
    const ast = parse(code ?? '', {
      plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
      sourceType: 'module',
    })

    let decorators_striped: string[] = []
    // Empty functions with one of the decorators. (ex @BackendMethod decorator)
    visit(ast.program, {
      visitFunction(path) {
        // @ts-ignore
        const decorators: any[] = path.node.decorators || []
        let foundDecorator = false

        // @ts-ignore
        path.node.decorators = decorators.filter(decorator => {
          if (
            decorator.expression.callee &&
            decorators_to_strip.includes(decorator.expression.callee.name)
          ) {
            foundDecorator = true
            decorators_striped.push(decorator.expression.callee.name)
            // We actually need to keep the decorator
            // return false;
          }
          return true
        })

        // If one of decorators was found, empty the function body
        if (foundDecorator) {
          path.node.body.body = []
        }

        this.traverse(path)
      },
    })

    let res = prettyPrint(ast.program, {})
    const info = decorators_striped.map(decorator => `Striped: '${decorator}'`)

    if (decorators_striped.length > 0) {
      const { code, info: newInfo } = await removeUnusedImports(res.code)
      res.code = code
      info.push(...newInfo)
    }

    return { ...res, info }
  } catch (error) {
    // if anything happens, just return the original code
    return { code, info: [] }
  }
}
