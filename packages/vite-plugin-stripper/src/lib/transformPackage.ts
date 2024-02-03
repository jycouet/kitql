import { parse } from '@babel/parser'
import * as recast from 'recast'

const {
  visit,
  types: { builders },
} = recast

export const removePackages = async (code: string, packages_to_strip: string[]) => {
  try {
    const ast = parse(code, {
      plugins: ['typescript', 'decorators-legacy', 'importAssertions'],
      sourceType: 'module',
    })

    const packages_striped: string[] = []

    visit(ast, {
      visitImportDeclaration(path) {
        const packageName = path.node.source.value
        if (packages_to_strip.includes(String(packageName))) {
          const specifiers = path.node.specifiers!
          const replacementNodes = specifiers
            .map((specifier) => {
              if (specifier.type === 'ImportSpecifier') {
                return builders.variableDeclaration('let', [
                  builders.variableDeclarator(
                    builders.identifier(String(specifier.imported.name)),
                    builders.literal(null),
                  ),
                ])
              }
            })
            .filter(Boolean) // Remove undefined values

          if (replacementNodes.length > 0) {
            path.replace(...replacementNodes)
            packages_striped.push(String(packageName))
          } else {
            path.prune()
          }
        }
        return false
      },
    })

    return {
      code: recast.print(ast).code,
      info: packages_striped.map((pkg) => `Replaced import from '${pkg}'`),
    }
  } catch (error) {
    return { code, info: [] }
  }
}
