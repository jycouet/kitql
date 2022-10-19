import type { Plugin } from 'vite'

import type { KitQLVite } from './KitQLVite'
import { generate } from './generate.js'

export function kitql(config?: KitQLVite): Plugin {
  return {
    name: 'kitql',

    async buildStart() {
      try {
        generate(config)
      } catch (e) {
        console.error(e)
      }
    },
  }
}
