import type { Actions } from './$types.d.ts'

export const actions = {
  default: async () => {
    return 'yop'
  },
  // withSearchParam: async () => {},
} satisfies Actions

export const load = async () => {
  return {}
}
