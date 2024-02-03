#!/usr/bin/env node
import { spawn, spawnSync } from 'child_process'
import fs from 'fs'
import { Option, program } from 'commander'

import { Log, red } from '@kitql/helpers'

const log = new Log('kitql-lint')

program.addOption(new Option('-f, --format', 'format'))
program.addOption(new Option('-g, --glob <type>', 'file/dir/glob (. by default)', '.'))
program.addOption(new Option('--verbose', 'add more logs', false))

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

let pathPrettierIgnore = findFileOrUp('.prettierignore')
let pathPrettierCjs = findFileOrUp('.prettierrc.cjs')

const format = options_cli.format ?? false
const glob = options_cli.glob ?? '.'
const verbose = options_cli.verbose ?? false

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

if (verbose) {
  log.info(cmdPrettier)
}
let result_prettier = spawn(cmdPrettier, {
  shell: true,
  cwd: process.cwd(),
  stdio: 'pipe',
})

// let's not log anything when we are formating prettier
if (!format) {
  const logPrettier = new Log('kitql-lint prettier')
  result_prettier.stdout.on('data', (data) => {
    logPrettier.error(
      data
        .toString()
        // rmv the last \n if any
        .replace(/\n$/, ''),
    )
  })
}
if (format && verbose) {
  const logPrettier = new Log('kitql-lint prettier')
  result_prettier.stdout.on('data', (data) => {
    logPrettier.success(
      data
        .toString()
        // rmv the last \n if any
        .replace(/\n$/, ''),
    )
  })
}

function esLintRun(code) {
  // Then eslint
  const cmdEsLint =
    `eslint` +
    // ignore?
    ` --ignore-path ${pathPrettierIgnore}` +
    // format or not
    `${format ? ' --fix' : ''}` +
    // exec
    ` ${glob}`

  if (verbose) {
    log.info(cmdEsLint)
  }

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
}

result_prettier.stdout.on('end', (data) => {
  if (verbose) {
    log.info(`end`, data)
  }
})
result_prettier.stdout.on('error', (data) => {
  if (verbose) {
    log.info(`error`, data)
  }
})
result_prettier.stdout.on('pause', (data) => {
  if (verbose) {
    log.info(`pause`, data)
  }
})
result_prettier.stdout.on('readable', (data) => {
  if (verbose) {
    log.info(`readable`, data)
  }
})
result_prettier.stdout.on('resume', (data) => {
  if (verbose) {
    log.info(`resume`, data)
  }
  esLintRun(0)
})

result_prettier.on('close', (data) => {
  if (verbose) {
    log.info(`close`, data)
  }
  esLintRun(data)
})
