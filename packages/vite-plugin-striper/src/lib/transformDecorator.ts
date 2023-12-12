import { parse } from '@babel/parser'
import * as recast from 'recast'
import { prettyPrint } from 'recast'

const { visit } = recast.types

export const transformDecorator = async (code: string, decorators_to_strip: string[]) => {
  try {
    const codeParsed = parse(code ?? '', {
      plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
      sourceType: 'module',
    }).program as recast.types.namedTypes.Program

    let transformed = false
    // const usedIdentifiersInToBeStriped = new Set<string>()
    // Empty functions with one of the decorators. (ex @BackendMethod decorator)
    visit(codeParsed, {
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
            // We actually need to keep the decorator
            // return false;
          }
          return true
        })

        // If one of decorators was found, empty the function body
        if (foundDecorator) {
          transformed = true
          path.node.body.body = []
        }

        this.traverse(path)
      },
      visitImportDeclaration(path) {
        const importSpecifiers = path.node.specifiers.filter(specifier =>
          usedIdentifiersInCode.has(specifier.local.name),
        )

        if (importSpecifiers.length === 0) {
          // If no specifiers are left, prune the import statement
          path.prune()
        } else {
          // Update the import statement with the remaining specifiers
          path.node.specifiers = importSpecifiers
        }

        this.traverse(path)
      },
    })
    // console.log(`usedIdentifiersInToBeStriped`, usedIdentifiersInToBeStriped)

    // Strip things
    if (false) {
      // Part 1: remove non-exported things
      visit(codeParsed, {
        visitFunctionDeclaration(path) {
          if (!path.node.id) {
            return this.traverse(path)
          }

          if (typeof path.node.id.name === 'string' && !path.node.id.name.startsWith('export ')) {
            path.prune()
          }

          this.traverse(path)
        },
        visitVariableDeclaration(path) {
          if (
            !path.node.declarations.some(
              decl =>
                // @ts-ignore
                decl.id.type === 'Identifier' &&
                // @ts-ignore
                decl.id.name.startsWith('export '),
            )
          ) {
            console.log(`path.node.id.name`, path.node)
            path.prune()
          }

          this.traverse(path)
        },
      })

      // Part 2: Remove unused imports
      const usedIdentifiersInCode = new Set<string>()
      // Traverse the AST to identify used identifiers
      visit(codeParsed, {
        visitIdentifier(path) {
          // Let's not add identifiers from import specifiers
          if (path.parentPath.value.type !== 'ImportSpecifier') {
            usedIdentifiersInCode.add(path.node.name)
          }

          this.traverse(path)
        },

        visitClassDeclaration(path) {
          // Capture identifiers in class decorators
          // @ts-ignore
          ;(path.node.decorators || []).forEach(decorator => {
            extractIdentifiersFromExpression(decorator.expression, usedIdentifiersInCode)
          })

          // Capture identifiers in class methods and properties
          path.node.body.body.forEach(element => {
            if (element.type === 'ClassMethod' || element.type === 'ClassProperty') {
              // Capture identifiers in element decorators
              // @ts-ignore
              ;(element.decorators || []).forEach(decorator => {
                extractIdentifiersFromExpression(decorator.expression, usedIdentifiersInCode)
              })
            }
          })

          this.traverse(path)
        },
      })

      // Remove unused identifiers within import statements from the AST
      visit(codeParsed, {
        visitImportDeclaration(path) {
          const importSpecifiers = path.node.specifiers!.filter(specifier =>
            usedIdentifiersInCode.has(specifier.local!.name as string),
          )

          if (importSpecifiers.length === 0) {
            // If no specifiers are left, prune the import statement
            path.prune()
          } else {
            // Update the import statement with the remaining specifiers
            path.node.specifiers = importSpecifiers
          }

          this.traverse(path)
        },
      })
    }

    return { ...prettyPrint(codeParsed, {}), transformed }
  } catch (error) {
    // if anything happens, just return the original code
    return { code, transformed: false }
  }
}

// Helper function to extract identifiers from an expression
// @ts-ignore
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
