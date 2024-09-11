#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { Option, program } from 'commander'

import { Log, red } from '@kitql/helpers'

const log = new Log('kitql-lint')

program.addOption(new Option('-f, --format', 'format'))
program.addOption(new Option('-g, --glob <type>', 'file/dir/glob (. by default)', '.'))
program.addOption(new Option('--verbose', 'add more logs', false))
program.addOption(
  new Option(
    '-p, --prefix <type>',
    'prefix by with "pnpm" or "npm" or "none" ("none" by default)',
    'none',
  ),
)

program.parse(process.argv)
const options_cli = program.opts()

const findFileOrUp = (fileName) => {
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

const pathPrettierIgnore = findFileOrUp('.prettierignore')
const pathPrettierCjs = findFileOrUp('.prettierrc.cjs')

const format = options_cli.format ?? false
const glob = options_cli.glob ?? '.'
const verbose = options_cli.verbose ?? false
const pre = options_cli.prefix ?? 'none'

let preToUse = ''
if (pre === 'npm') {
  preToUse = 'npm exec '
} else if (pre === 'pnpm') {
  preToUse = 'pnpm '
} else {
  preToUse = ''
}

function prettierRun() {
  const cmdPrettier =
    preToUse +
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

  if (verbose) {
    log.info(cmdPrettier)
  }
  const result_prettier = spawnSync(cmdPrettier, {
    shell: true,
    cwd: process.cwd(),
    stdio: 'inherit',
  })

  return result_prettier
}

function eslintRun() {
  // Then eslint
  const cmdEsLint =
    preToUse +
    `eslint` +
    // ignore?
    ` --ignore-pattern ${pathPrettierIgnore}` +
    // format or not
    `${format ? ' --fix' : ''}` +
    // exec
    ` ${glob}`

  if (verbose) {
    log.info(cmdEsLint)
  }

  const result_eslint = spawnSync(cmdEsLint, {
    shell: true,
    cwd: process.cwd(),
    stdio: 'inherit',
  })

  return result_eslint
}

const eslintCode = eslintRun()
if (eslintCode.status) {
  log.error(red(`eslint failed, check logs above.`))
  process.exit(eslintCode.status)
}

const prettierCode = prettierRun()
if (prettierCode.status) {
  log.error(red(`prettier failed, check logs above.`))
  process.exit(eslintCode.status)
}

log.success(`All good, your files looks great!`)
process.exit(0)
