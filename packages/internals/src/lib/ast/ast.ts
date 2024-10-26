// import { prettyPrint } from 'recast'
import { parse } from '@babel/parser'
import * as recast from 'recast'
import { parse as parseSvelte } from 'svelte/compiler'
import type { BaseNode, TemplateNode } from 'svelte/types/compiler/interfaces'

import { read } from '../fs/fs.js'

// very basic
type ElementAttr = { type: 'a' | 'img'; attr: 'href' | 'src' }
type Found = {
  element: ElementAttr
  pathFile: string
  line: number
  column: number
  type: string
  raw: string
  data: string
}

export function format(f: Found) {
  const str = `${f.pathFile}:${f.line}:${f.column} ${f.element.type} ${f.element.attr} ${f.data}`
  // console.log(`str`, str)
  return str
}

export function extractHtmlElementAttr_Text(pathFile: string, elements: ElementAttr[]) {
  const source = read(process.cwd() + pathFile) ?? ''
  const parsed = parseSvelte(source)

  const found: Found[] = []

  function getLineAndColumn(index: number): { line: number; column: number } {
    const lines = source.substring(0, index).split('\n')
    const line = lines.length
    const column = lines[lines.length - 1].length + 1 // +1 for 1-based index
    return { line, column }
  }

  function traverse(node: TemplateNode) {
    elements.forEach((element) => {
      if (node.type === 'Element' && node.name === element.type) {
        const hrefAttribute: BaseNode = node.attributes.find(
          (attr: { name: string }) => attr.name === element.attr,
        )
        if (hrefAttribute && hrefAttribute.value.length && hrefAttribute.value[0].type === 'Text') {
          const { line, column } = getLineAndColumn(hrefAttribute.start + element.attr.length + 1)
          found.push({
            element,
            pathFile,
            line,
            column,
            type: hrefAttribute.value[0].type,
            raw: hrefAttribute.value[0].raw,
            data: hrefAttribute.value[0].data,
          })
        }
      }
    })

    if (node.children) {
      node.children.forEach((child) => traverse(child))
    }
  }

  traverse(parsed.html)

  return found
}

export function parseTs(source: string | null) {
  const parsed = parse(source ?? '', {
    plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
    sourceType: 'module',
  }).program as recast.types.namedTypes.Program

  return parsed
}

export const { visit } = recast.types
