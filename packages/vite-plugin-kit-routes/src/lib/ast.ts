import { parse } from '@babel/parser'
import * as recast from 'recast'

import { cyan, red, yellow } from '@kitql/helpers'
import { read } from '@kitql/internals'

import { log, routes_path } from './plugin.js'

const { visit } = recast.types

export const getMethodsOfServerFiles = (pathFile: string) => {
  const code = read(`${routes_path()}/${pathFile}/${'+server.ts'}`)

  const codeParsed = parse(code ?? '', {
    plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
    sourceType: 'module',
  }).program as recast.types.namedTypes.Program

  const exportedNames: string[] = []
  visit(codeParsed, {
    visitExportNamedDeclaration(path) {
      const declaration = path.node.declaration

      // Check for variable declarations
      if (declaration?.type === 'VariableDeclaration') {
        declaration.declarations.forEach(declaration => {
          if (
            declaration.type === 'VariableDeclarator' &&
            declaration.id.type === 'Identifier' &&
            declaration.id.name
          ) {
            exportedNames.push(declaration.id.name)
          }
        })
      }

      // Check for function declarations
      if (declaration?.type === 'FunctionDeclaration') {
        if (declaration.id && declaration.id.name) {
          exportedNames.push(String(declaration.id.name))
        }
      }

      // Check for export specifiers (for aliased exports)
      const specifiers = path.node.specifiers
      if (specifiers) {
        specifiers.forEach(specifier => {
          if (specifier.exported.name) {
            exportedNames.push(String(specifier.exported.name))
          }
        })
      }

      return false
    },
  })

  return exportedNames
}

export const getActionsOfServerPages = (pathFile: string) => {
  const pathToFile = `${pathFile}/+page.server.ts`
  const code = read(`${routes_path()}/${pathFile}/${'+page.server.ts'}`)

  let withLoad = false

  const codeParsed = parse(code ?? '', {
    plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
    sourceType: 'module',
  }).program as recast.types.namedTypes.Program

  let actions: string[] = []
  visit(codeParsed, {
    visitExportNamedDeclaration(path) {
      // @ts-ignore
      const declarations = path.node.declaration?.declarations
      if (declarations) {
        declarations.forEach((declaration: any) => {
          if (declaration.id.name === 'actions') {
            const properties =
              // if } satisfies Actions
              declaration.init.expression?.properties ??
              // if no satisfies Actions
              declaration.init.properties

            if (properties) {
              properties.forEach((property: any) => {
                actions.push(property.key.name)
              })
            }
          }
          if (declaration.id.name === 'load') {
            withLoad = true
          }
        })
      }
      return false
    },
  })

  if (actions.length > 1 && actions.includes('default')) {
    // Let's remove the default action form our list, and say something
    actions = actions.filter(c => c !== 'default')
    log.error(
      `In file: ${yellow(pathToFile)}` +
        `\n\t      When using named actions (${yellow(actions.join(', '))})` +
        `, the ${red('default')} action cannot be used. ` +
        `\n\t      See the docs for more info: ` +
        `${cyan(`https://kit.svelte.dev/docs/form-actions#named-actions`)}`,
    )
  }

  // TODO: withLoad to be used one day? with PAGE_SERVER_LOAD? PAGE_LOAD?
  return { actions, withLoad }
}
