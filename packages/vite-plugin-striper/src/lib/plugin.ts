import { green, Log, yellow } from '@kitql/helpers'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import watch_and_run from 'vite-plugin-watch-and-run'

import { transformDecorator } from './transformDecorator.js'
import { transformWarningThrow, type WarningThrow } from './transformWarningThrow.js'

export type ViteStriperOptions = {
  /**
   * for example: `['BackendMethod']`
   */
  decorators?: string[]

  /**
   * If true, skip warnings if a throw is not a class.
   *
   * Default: `true`
   */
  log_warning_on_throw_is_not_a_class?: boolean

  /**
   * internal usage ;-)
   */
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
export function striper(options?: ViteStriperOptions): Plugin[] {
  const log = new Log('striper')
  let listOrThrow: WarningThrow[] = []
  const logWarningThrow =
    options?.log_warning_on_throw_is_not_a_class === undefined ||
    options?.log_warning_on_throw_is_not_a_class === true

  return [
    {
      name: 'vite-plugin-striper-decorator',
      enforce: 'pre',

      buildStart: () => {
        listOrThrow = []
      },

      transform: async (code, filepath, option) => {
        if (logWarningThrow) {
          const prjPath = process.cwd()
          // Only file in our project
          if (filepath.startsWith(prjPath)) {
            const { list } = await transformWarningThrow(filepath, code, logWarningThrow)
            listOrThrow.push(
              ...list.map(item => ({ ...item, pathFile: filepath.replace(prjPath, '') })),
            )
          }
        }

        // Don't transform server-side code
        if (option?.ssr) {
          return
        }
        // files are only in ts
        if (!filepath.endsWith('.ts')) {
          return
        }

        if (options && (options?.decorators ?? []).length > 0) {
          const { transformed, ...rest } = await transformDecorator(code, options.decorators ?? [])

          if (options?.debug && transformed) {
            log.info(
              `` +
                `${green('-----')} after transform of ${yellow(filepath)}` +
                `${rest.code}` +
                `${green('-----')}` +
                ``,
            )
          }

          return rest
        }

        return
      },

      buildEnd: async () => {
        listOrThrow.forEach(item => {
          log.error(
            `Throw is not a new class in ${yellow(item.pathFile)}:${yellow(String(item.line))}`,
          )
        })
      },
    },

    // Run the thing when any change in a +page.svelte (add, remove, ...)
    watch_and_run([
      {
        name: 'kit-routes-watch',
        logs: [],
        watch: ['**/*.ts'],
        run: async (server, absolutePath) => {
          if (logWarningThrow) {
            const prjPath = process.cwd()

            // Only file in our project
            if (absolutePath && absolutePath.startsWith(prjPath)) {
              const code = readFileSync(absolutePath, { encoding: 'utf8' })

              const { list } = await transformWarningThrow(
                absolutePath + '?' + new Date().toISOString(),
                code,
                logWarningThrow,
              )
              listOrThrow.push(
                ...list.map(item => ({ ...item, pathFile: absolutePath.replace(prjPath, '') })),
              )
              listOrThrow.forEach(item => {
                log.error(
                  `Throw is not a new class in ${yellow(item.pathFile)}:${yellow(
                    String(item.line),
                  )}`,
                )
              })
            }
          }
        },
      },
    ]),
  ]
}
