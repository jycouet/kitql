import { parse } from '@babel/parser'
import * as recast from 'recast'

const { visit } = recast.types

export const removePackages = async (code: string, packages_to_strip: string[]) => {
  try {
    const ast = parse(code, {
      plugins: ['typescript', 'decorators-legacy', 'importAssertions'],
      sourceType: 'module',
    })

    const packages_striped: string[] = []

    // Code to remove imports
    visit(ast, {
      visitImportDeclaration(path) {
        const packageName = path.node.source.value
        if (packages_to_strip.includes(String(packageName))) {
          path.prune()
          packages_striped.push(String(packageName))
        }
        return false
      },
    })

    return {
      code: recast.print(ast).code,
      info: packages_striped.map(pkg => `Striped: '${pkg}'`),
    }
  } catch (error) {
    return { code, info: [] }
  }
}
