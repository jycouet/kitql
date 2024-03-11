import { readFileSync } from 'fs'
import type { Plugin } from 'vite'
import { watchAndRun } from 'vite-plugin-watch-and-run'

import { gray, green, Log, yellow } from '@kitql/helpers'
import { getFilesUnder } from '@kitql/internals'

import { transformDecorator } from './transformDecorator.js'
import { removePackages } from './transformPackage.js'
import { transformWarningThrow, type WarningThrow } from './transformWarningThrow.js'

export type ViteStriperOptions = {
  /**
   * for example: `['BackendMethod']`
   */
  decorators?: string[]

  /**
   * If true, will empty almost all the file if a decorator is found. (experimental!)
   */
  hard?: boolean

  /**
   * For example if you set `nullify: ['mongodb']`
   * 
   * ```ts
   * // This line
   * import { ObjectId } from 'mongodb'
   * 
   * // We become
   * let ObjectId = null;
   * ```
   */
  nullify?: string[]

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
  import { stripper } from "vite-plugin-stripper";   // 👈
  
  export default defineConfig({
    plugins: [
      stripper({ decorators: ['BackendMethod'] }),  // 👈
      sveltekit()
    ],
  });
 * ```
 * 
 */
export function stripper(options?: ViteStriperOptions): Plugin[] {
  const log = new Log('stripper')
  let listOrThrow: WarningThrow[] = []

  const display = () => {
    listOrThrow.forEach((item) => {
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
      name: 'vite-plugin-stripper',
      enforce: 'pre',

      config: async () => {
        if (options?.log_on_throw_is_not_a_new_class) {
          const files = getFilesUnder(getProjectPath())
          listOrThrow = []
          for (let i = 0; i < files.length; i++) {
            const absolutePath = getProjectPath() + '/' + files[i]
            const code = readFileSync(absolutePath, { encoding: 'utf8' })
            const { list } = await transformWarningThrow(
              absolutePath,
              getProjectPath(),
              code,
              options?.log_on_throw_is_not_a_new_class,
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

        let infosNumber = 0

        if (options && options?.decorators && options.decorators.length > 0) {
          const { info, ...rest } = await transformDecorator(
            code,
            options.decorators,
            options.hard ?? false,
          )

          // Update the code for later transforms & return it
          code = rest.code

          infosNumber += info.length

          if (options?.debug && info.length > 0) {
            log.info(
              `` +
                `${gray('File:')} ${yellow(filepath)}\n` +
                `${green('-----')}\n` +
                `${rest.code}` +
                `\n${green(':::::')}\n` +
                `${info.join('\n')}` +
                `\n${green('-----')}` +
                ``,
            )
          }
        }

        if (options && options?.nullify && options.nullify.length > 0) {
          const { info, ...rest } = await removePackages(code, options.nullify)

          // Update the code for later transforms & return it
          code = rest.code

          infosNumber += info.length

          if (options?.debug && info.length > 0) {
            log.info(
              `` +
                `${gray('File:')} ${yellow(filepath)}\n` +
                `${green('-----')}\n` +
                `${rest.code}` +
                `\n${green(':::::')}\n` +
                `${info.join('\n')}` +
                `\n${green('-----')}` +
                ``,
            )
          }
        }

        if (infosNumber > 0) {
          return { code, map: null }
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
          if (options?.log_on_throw_is_not_a_new_class) {
            // Only file in our project
            if (absolutePath && absolutePath.startsWith(getProjectPath())) {
              const code = readFileSync(absolutePath, { encoding: 'utf8' })

              const { list } = await transformWarningThrow(
                absolutePath,
                getProjectPath(),
                code,
                options?.log_on_throw_is_not_a_new_class,
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
