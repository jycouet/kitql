import { parse } from '@babel/parser'
import * as recast from 'recast'
import { prettyPrint } from 'recast'

const { visit } = recast.types

export type WarningThrow = {
  pathFile: string
  line: number
}

export const transformWarningThrow = async (
  pathFile: string,
  code: string,
  log_warning_on_throw_is_not_a_class: boolean,
) => {
  try {
    const codeParsed = parse(code ?? '', {
      plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
      sourceType: 'module',
    }).program as recast.types.namedTypes.Program

    let list: WarningThrow[] = []

    visit(codeParsed, {
      visitFunction(path) {
        // Existing code for processing functions...
        this.traverse(path)
      },
      visitThrowStatement(path) {
        if (log_warning_on_throw_is_not_a_class) {
          const thrownExpr = path.node.argument
          // Check if thrownExpr is not a class
          if (thrownExpr && thrownExpr.type !== 'NewExpression') {
            list.push({ pathFile, line: path.node.loc?.start.line ?? 0 })
          }
        }
        this.traverse(path)
      },
    })

    return { list }
  } catch (error) {
    // if anything happens, just return the original code
    return { list: [] }
  }
}
