import type { Plugin } from 'vite'
import { generate } from '.'
import type { KitQLVite } from './KitQLVite'

export function kitql(configFile: KitQLVite): Plugin {
  return {
    name: 'kitql',

    async buildStart() {
      try {
        generate(configFile)
      } catch (e) {
        console.error(`e`, e)
      }
    },
  }
}
