import { type FieldNode,type GraphQLResolveInfo, Kind } from 'graphql'
import { stry0 } from '@kitql/helper'
import type { InlineFragmentNode } from 'graphql'
import type { FragmentDefinitionNode } from 'graphql'

function extractSelectionSet(
  node: FieldNode | InlineFragmentNode | FragmentDefinitionNode,
  info: GraphQLResolveInfo,
) {
  const a = []

  node.selectionSet.selections.map(c => {
    if (c.kind === Kind.FIELD) {
      a.push(c.name.value)
    } else if (c.kind === Kind.INLINE_FRAGMENT) {
      extractSelectionSet(c, info).forEach(d => {
        a.push(d)
      })
    } else if (c.kind === Kind.FRAGMENT_SPREAD) {
      extractSelectionSet(info.fragments[c.name.value], info).forEach(d => {
        a.push(d)
      })
    } else {
      console.error(`extractSelectionSet, unknown kind: "${stry0(c)}"`)
      throw new Error('Unknown kind')
    }
  })

  // make it unique!
  return [...new Set(a)]
}

export const rootFields = (info: GraphQLResolveInfo) => {
  const fields = info.fieldNodes.flatMap(c => {
    return extractSelectionSet(c, info)
  })

  return fields
}
