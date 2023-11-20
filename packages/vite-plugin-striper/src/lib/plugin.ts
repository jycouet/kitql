import { green, Log, yellow } from '@kitql/helpers'
import type { Plugin } from 'vite'

import { transform } from './transform.js'

export type ViteStriperOptions = {
  /**
   * for example: `['BackendMethod']`
   */
  decorators: string[]

  debug?: boolean
}

/**
 * Add this vite plugin in your vite.config.ts as first one.
 * 
 * It should look like this:
 * ```ts
  import { sveltekit } from "@sveltejs/kit/vite";
  import { defineConfig } from "vite";
  import { striper } from "vite-plugin-striper";   // 👈
  
  export default defineConfig({
    plugins: [
      striper({ decorators: ['BackendMethod'] }),  // 👈
      sveltekit()
    ],
  });
 * ```
 * 
 */
export function striper(options: ViteStriperOptions): Plugin {
  const log = new Log('striper')

  return {
    name: 'vite-plugin-striper',
    enforce: 'pre',

    transform: async (code, filepath, option) => {
      // Don't transform server-side code
      if (option?.ssr) {
        return
      }
      // files are only in ts
      if (!filepath.endsWith('.ts')) {
        return
      }

      const { transformed, ...rest } = await transform(code, options.decorators ?? [])

      if (options?.debug && transformed) {
        log.info(`
${green('-----')} after transform of ${yellow(filepath)}
${rest.code}
${green('-----')}
`)
      }

      return rest
    },
  }
}
