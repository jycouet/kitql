import { compile, parse as svelteParse } from 'svelte/compiler'

export const parseSvelte = (source: string) => {
  svelteParse(source, { customElement: true })
  // const ast = compile(source, { generate: false })
}
