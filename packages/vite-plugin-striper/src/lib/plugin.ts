import { gray, green, Log, yellow } from '@kitql/helpers'
import { getFilesUnder } from '@kitql/internals'
import { readFileSync } from 'fs'
import type { Plugin } from 'vite'
import { watchAndRun } from 'vite-plugin-watch-and-run'

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
   * @default false
   */
  log_on_throw_is_not_a_new_class?: boolean

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
export function striper(sCptions?: ViteStriperOptions): Plugin[] {
  const log = new Log('striper')
  let listOrThrow: WarningThrow[] = []

  const display = () => {
    listOrThrow.forEach(item => {
      log.error(
        `Throw is not a new class in ${yellow(item.relativePathFile)}:${yellow(String(item.line))}`,
      )
    })
    listOrThrow = []
  }

  const getProjectPath = () => {
    return process.cwd() + '/src'
  }

  return [
    {
      name: 'vite-plugin-striper-decorator',
      enforce: 'pre',

      config: async () => {
        if (sCptions?.log_on_throw_is_not_a_new_class) {
          let files = getFilesUnder(getProjectPath())
          listOrThrow = []
          for (let i = 0; i < files.length; i++) {
            const absolutePath = getProjectPath() + '/' + files[i]
            const code = readFileSync(absolutePath, { encoding: 'utf8' })
            const { list } = await transformWarningThrow(
              absolutePath,
              getProjectPath(),
              code,
              sCptions?.log_on_throw_is_not_a_new_class,
            )
            listOrThrow.push(...list)
          }
          display()
        }
      },

      transform: async (code, filepath, option) => {
        // Don't transform server-side code
        if (option?.ssr) {
          return
        }
        // files are only in ts
        if (!filepath.endsWith('.ts')) {
          return
        }

        if (sCptions && (sCptions?.decorators ?? []).length > 0) {
          const { info, ...rest } = await transformDecorator(code, sCptions.decorators ?? [])

          if (sCptions?.debug && info.length > 0) {
            log.info(
              `` +
                `${gray('File :')} ${yellow(filepath)}\n` +
                `${green('-----')}\n` +
                `${rest.code}` +
                `\n${green(':::::')}\n` +
                `${info}` +
                `\n${green('-----')}` +
                ``,
            )
          }

          return rest
        }

        return
      },
    },

    // Run the thing when any change in a +page.svelte (add, remove, ...)
    watchAndRun([
      {
        name: 'kit-routes-watch',
        logs: [],
        watch: ['**'],
        run: async (server, absolutePath) => {
          if (sCptions?.log_on_throw_is_not_a_new_class) {
            // Only file in our project
            if (absolutePath && absolutePath.startsWith(getProjectPath())) {
              const code = readFileSync(absolutePath, { encoding: 'utf8' })

              const { list } = await transformWarningThrow(
                absolutePath,
                getProjectPath(),
                code,
                sCptions?.log_on_throw_is_not_a_new_class,
              )
              listOrThrow.push(...list)
              display()
            }
          }
        },
      },
    ]),
  ]
}
