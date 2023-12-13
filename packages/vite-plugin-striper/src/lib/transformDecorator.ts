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
        // Let's not add identifiers from import specifiers
        if (path.parentPath.value.type !== 'ImportSpecifier') {
          usedIdentifiers.add(path.node.name)
        }

        this.traverse(path)
      },

      visitClassDeclaration(path) {
        // Capture identifiers in class decorators
        // @ts-ignore
        ;(path.node.decorators || []).forEach(decorator => {
          extractIdentifiersFromExpression(decorator.expression, usedIdentifiers)
        })

        // Capture identifiers in class methods and properties
        path.node.body.body.forEach(element => {
          if (element.type === 'ClassMethod' || element.type === 'ClassProperty') {
            // Capture identifiers in element decorators
            // @ts-ignore
            ;(element.decorators || []).forEach(decorator => {
              extractIdentifiersFromExpression(decorator.expression, usedIdentifiers)
            })
          }
        })

        this.traverse(path)
      },
    })

    // console.log(`usedIdentifiers`, usedIdentifiers)

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
