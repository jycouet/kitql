#!/usr/bin/env node
import { Log, red } from '@kitql/helpers'
import { spawn, spawnSync } from 'child_process'
import { program, Option } from 'commander'
import fs from 'fs'

const log = new Log('kitql-lint')

program.addOption(new Option('-f, --format', 'format'))
program.addOption(new Option('-g, --glob <type>', 'file/dir/glob (. by default)', '.'))

program.parse(process.argv)
const options_cli = program.opts()

const findFileOrUp = fileName => {
  // Find file recursively 4 levels max up
  for (let i = 0; i < 4; i++) {
    try {
      const path = '../'.repeat(i) + fileName
      if (fs.statSync(path)) {
        return path
      }
    } catch (error) {
      // nothing to do
    }
  }

  log.error(red(`${fileName} not found`))
  process.exit(1)
}

let pathPrettierIgnore = findFileOrUp('.prettierignore')
let pathPrettierCjs = findFileOrUp('.prettierrc.cjs')

const format = options_cli.format ?? false
const glob = options_cli.glob ?? '.'

// First prettier
const cmdPrettier =
  `prettier` +
  ` --list-different` +
  // ignore?
  ` --ignore-path ${pathPrettierIgnore}` +
  // config
  ` --config ${pathPrettierCjs}` +
  // format or not
  `${format ? ' --write' : ''}` +
  // exec
  ` ${glob}`
let result_prettier = spawn(cmdPrettier, {
  shell: true,
  cwd: process.cwd(),
  stdio: 'pipe',
})

// let's not log anything when we are formating prettier
if (!format) {
  const logPrettier = new Log('kitql-lint prettier')
  result_prettier.stdout.on('data', data => {
    logPrettier.error(
      data
        .toString()
        // rmv the last \n if any
        .replace(/\n$/, ''),
    )
  })
}

result_prettier.on('close', code => {
  // Then eslint
  const cmdEsLint =
    `eslint` +
    // ignore?
    ` --ignore-path ${pathPrettierIgnore}` +
    // format or not
    `${format ? ' --fix' : ''}` +
    // exec
    ` ${glob}`

  // log.info(cmdEsLint)

  let result_eslint = spawnSync(cmdEsLint, {
    shell: true,
    cwd: process.cwd(),
    stdio: 'inherit',
  })

  if (result_eslint.status) {
    log.error(red(`eslint failed, check logs above.`))
  }

  if (code === 0 && result_eslint.status === 0) {
    log.success(`All good, your files looks great!`)
  }

  process.exit(code || result_eslint.status)
})
