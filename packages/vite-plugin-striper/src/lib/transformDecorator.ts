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
    })

    // Strip things
    if (transformed) {
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
            path.prune()
          }

          this.traverse(path)
        },
      })

      // Part 2: Remove unused imports
      const usedIdentifiersInCode = new Set()
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
          ;(path.node.decorators || []).forEach(decorator => {
            extractIdentifiersFromExpression(decorator.expression, usedIdentifiersInCode)
          })

          // Capture identifiers in class methods and properties
          path.node.body.body.forEach(element => {
            if (element.type === 'ClassMethod' || element.type === 'ClassProperty') {
              // Capture identifiers in element decorators
              ;(element.decorators || []).forEach(decorator => {
                extractIdentifiersFromExpression(decorator.expression, usedIdentifiersInCode)
              })
            }
          })

          this.traverse(path)
        },

        // visitClassDeclaration(path) {
        //   // @ts-ignore
        //   if (path.node.decorators) {
        //     // @ts-ignore
        //     const vals = path.node.decorators.map(
        //       // @ts-ignore
        //       a => a.expression.callee.name,
        //     )
        //     // @ts-ignore
        //     usedIdentifiersInCode.add(...vals)
        //   }

        //   path.node.body.body.forEach(element => {
        //     if (element.type === 'ClassProperty') {
        //       // @ts-ignore
        //       const vals = element.decorators
        //         // @ts-ignore
        //         .map(d => d.expression)
        //         // @ts-ignore
        //         .map(e => e.callee)
        //         // @ts-ignore
        //         .map(f => f.object.name)
        //       // @ts-ignore
        //       usedIdentifiersInCode.add(...vals)
        //     }
        //   })

        //   this.traverse(path)
        // },
      })

      // Remove unused identifiers within import statements from the AST
      visit(codeParsed, {
        visitImportDeclaration(path) {
          const importSpecifiers = path.node.specifiers!.filter(specifier =>
            usedIdentifiersInCode.has(specifier.local!.name),
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
function extractIdentifiersFromExpression(expression, identifierSet) {
  if (!expression) return

  if (expression.type === 'Identifier') {
    identifierSet.add(expression.name)
  } else if (expression.type === 'MemberExpression') {
    extractIdentifiersFromExpression(expression.object, identifierSet)
    extractIdentifiersFromExpression(expression.property, identifierSet)
  } else if (expression.type === 'CallExpression') {
    extractIdentifiersFromExpression(expression.callee, identifierSet)
    expression.arguments.forEach(arg => extractIdentifiersFromExpression(arg, identifierSet))
  } else if (expression.type === 'ArrayExpression') {
    // Process each element in the array
    expression.elements.forEach(element => {
      extractIdentifiersFromExpression(element, identifierSet)
    })
  }
  // Add other expression types as needed
}
