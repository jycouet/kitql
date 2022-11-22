import { createContext, generate as codeGen_generate } from '@graphql-codegen/cli'
import { Log } from '@kitql/helper'
import { resolve } from 'path'
import type { Plugin } from 'vite'
import watch_and_run from 'vite-plugin-watch-and-run'

import type { KitQLVite } from './KitQLVite.js'
import { generate as kitql_generate } from './generate.js'

const log = new Log('KitQL')

export function kitql(config?: KitQLVite): Plugin[] {
  return [
    {
      name: 'kitql',

      async buildStart() {
        await gooo(config)
      },
    },

    watch_and_run([
      {
        name: 'kitql',
        watch: resolve('src/**/*.(graphql)'),
        run: () => gooo(config),
        quiet: true,
      },
    ]),
  ]
}

async function gooo(config?: KitQLVite) {
  try {
    // Codegen
    const context = await createContext({
      project: config?.projectName ?? 'init',
      config: '',
      watch: false,
      require: [],
      overwrite: true,
      silent: true,
      errorsOnly: false,
      profile: false,
    })

    await codeGen_generate(context)

    // KitQL (needs to be second as we write in the codegen module files)
    kitql_generate(log, config)
  } catch (e) {
    kitql_generate(log, config)
    log.error(e.message)
  }
}
