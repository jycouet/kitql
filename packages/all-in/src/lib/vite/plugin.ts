import type { Plugin } from 'vite'
import { generate } from '.'
import type { KitQLVite } from './KitQLVite'

export function kitql(config?: KitQLVite): Plugin {
  return {
    name: 'kitql',

    async buildStart() {
      try {
        generate(config)
      } catch (e) {
        console.error(`e`, e)
      }
    },
  }
}
