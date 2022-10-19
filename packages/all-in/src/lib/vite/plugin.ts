import { createContext, generate as codeGen_generate } from '@graphql-codegen/cli'
import { Log, logGreen } from '@kitql/helper'
import { resolve } from 'path'
import type { Plugin } from 'vite'
import watch_and_run from 'vite-plugin-watch-and-run'

import type { KitQLVite } from './KitQLVite.js'
import { generate } from './generate.js'

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

    // KitQL
    generate(config)
  } catch (e) {
    console.error(e)
  }
}
