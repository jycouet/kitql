import { parseTs, prettyPrint, visit } from '@kitql/internals'
import type { Statement } from '@kitql/internals'

export const removeUnusedImports = async (code: string) => {
  try {
    const program = parseTs(code)

    const usedIdentifiers = new Set()
    const originalImports = new Map()

    // Step 1: Remove all global imports and store them
    const newBody: Statement[] = []
    program.body.forEach((node) => {
      if (node.type === 'ImportDeclaration') {
        ;(node.specifiers ?? []).forEach((specifier) => {
          if (specifier.type === 'ImportSpecifier') {
            const name =
              specifier.imported && specifier.imported.type === 'Identifier'
                ? specifier.imported.name
                : specifier.local?.name
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
    program.body = newBody

    // Step 2: List all identifiers used in the code
    visit(program, {
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
        ;(path.node.decorators || []).forEach((decorator) => {
          extractIdentifiersFromExpression(decorator.expression, usedIdentifiers)
        })

        // Capture identifiers in class methods and properties
        path.node.body.body.forEach((element) => {
          if (element.type === 'ClassMethod' || element.type === 'ClassProperty') {
            // Capture identifiers in element decorators
            // @ts-ignore
            ;(element.decorators || []).forEach((decorator) => {
              extractIdentifiersFromExpression(decorator.expression, usedIdentifiers)
            })
          }
        })

        this.traverse(path)
      },
    })

    let removed = Array.from(originalImports)

    // Step 3: Add back necessary imports
    const necessaryImports: Statement[] = []
    usedIdentifiers.forEach((identifier) => {
      if (originalImports.has(identifier)) {
        const source = originalImports.get(identifier)
        removed = removed.filter(([id, src]) => !(id === identifier && src === source))
        // @ts-ignore
        const found = necessaryImports.find((importDecl) => importDecl.source.value === source)
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
    program.body.unshift(...necessaryImports)

    return {
      code: prettyPrint(program).code,
      info: removed.map(([id, src]) => `Removed: '${id}' from '${src}'`),
    }
  } catch (error) {
    return { code, info: [] }
  }
}

export const transformDecorator = async (
  code: string,
  decorators_to_strip: string[],
  hard: boolean,
) => {
  try {
    const program = parseTs(code)

    let currentClassName = '' // Variable to hold the current class name
    const decorators_striped: { decorator: string; functionName: string; className: string }[] = []

    // Empty functions with one of the decorators. (ex @BackendMethod decorator)
    visit(program, {
      visitClassDeclaration(path) {
        // @ts-ignore
        currentClassName = path.node.id.name
        this.traverse(path)
      },
      visitFunction(path) {
        // @ts-ignore
        const decorators: any[] = path.node.decorators || []
        let foundDecorator = false

        let functionName: string
        // Check if the function is a standalone function or a method in a class
        if (path.node.id && path.node.id.name) {
          // Standalone function
          functionName =
            typeof path.node.id.name === 'string' ? path.node.id.name : 'IdentifierKind'
          // @ts-ignore
        } else if (path.node.key && path.node.key.name) {
          // @ts-ignore
          functionName = path.node.key.name
        }

        // @ts-ignore
        path.node.decorators = decorators.filter((decorator) => {
          if (
            decorator.expression.callee &&
            decorators_to_strip.includes(decorator.expression.callee.name)
          ) {
            foundDecorator = true

            // Push both the decorator name and the associated function name
            decorators_striped.push({
              className: currentClassName,
              decorator: decorator.expression.callee.name,
              functionName: functionName ?? '???',
            })

            // We actually need to keep the decorator
            // return false;
          }
          return true
        })

        // If one of the decorators was found, empty the function body and remove types
        if (foundDecorator) {
          path.node.body.body = []

          // Remove the return type of the function
          if (path.node.returnType) {
            delete path.node.returnType
          }

          // Remove the types of all parameters
          path.node.params.forEach((param) => {
            // @ts-ignore
            if (param.typeAnnotation) {
              // @ts-ignore
              delete param.typeAnnotation
            }
          })
        }

        this.traverse(path)
      },
    })

    const res = prettyPrint(program, {})
    const info = decorators_striped.map(
      (decorator) => `Striped: ${JSON.stringify(Object.values(decorator))}`,
    )

    if (decorators_striped.length > 0) {
      const { code, info: newInfo } = await removeUnusedImports(res.code)
      res.code = code
      info.push(...newInfo)
    }

    if (decorators_striped.length > 0 && hard) {
      // decorators_striped group by className with valid typescript
      const groupedByClassName = decorators_striped.reduce(
        (
          acc: Record<string, { decorator: string; functionName: string; className: string }[]>,
          item,
        ) => {
          if (!acc[item.className]) {
            acc[item.className] = []
          }
          acc[item.className].push(item)
          return acc
        },
        {},
      )

      res.code = `import { BackendMethod } from 'remult'

${Object.entries(groupedByClassName).map(([className, decorators]) => {
  return `export class ${className} {${decorators
    .map(
      (c) => `\n  @BackendMethod({})
  static async ${c.functionName}() {}`,
    )
    .join('')}
}`
})}`
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
