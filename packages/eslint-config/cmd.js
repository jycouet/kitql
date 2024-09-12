#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { Option, program } from 'commander'
import ora from 'ora'

import { bgBlueBright, gray, red } from '@kitql/helpers'

import { findFileOrUp } from './helper/findFileOrUp.js'

const spinner = ora({
  // hideCursor: true,
  prefixText: bgBlueBright(` kitql-lint `),
  text: 'check config',
})
spinner.start()

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

async function customSpawn(cmd) {
  const child = spawn(cmd, {
    shell: true,
    cwd: process.cwd(),
    stdio: 'inherit',
  })
  // console.log(`child`, child)

  let data = ''
  // for await (const chunk of child?.stdout) {
  //   console.log('stdout chunk: ' + chunk)
  //   data += chunk
  // }
  let error = ''
  // for await (const chunk of child?.stderr) {
  //   console.error('stderr chunk: ' + chunk)
  //   error += chunk
  // }
  const exitCode = await new Promise((resolve, reject) => {
    child.on('close', resolve)
  })

  if (exitCode) {
    // throw new Error(`subprocess error exit ${exitCode}, ${error}`)
    return { status: exitCode, error }
  }
  return data
}

async function eslintRun() {
  const cmdEsLint =
    preToUse +
    `eslint` +
    // format or not
    `${format ? ' --fix' : ''}` +
    // exec
    ` ${glob}`

  spinner.text = verbose ? 'eslint ' + gray(`(${cmdEsLint})`) : 'eslint'

  const result_eslint = await customSpawn(cmdEsLint)

  return result_eslint
}

async function prettierRun() {
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

  spinner.text = verbose ? 'prettier ' + gray(`(${cmdPrettier})`) : 'prettier'

  const result_prettier = await customSpawn(cmdPrettier)

  return result_prettier
}

const eslintCode = await eslintRun()
if (eslintCode.status) {
  spinner.fail(red(`eslint failed, check logs above.`))
  process.exit(eslintCode.status)
}

const prettierCode = await prettierRun()
if (prettierCode.status) {
  spinner.fail(red(`prettier failed, check logs above.`))
  process.exit(eslintCode.status)
}

spinner.succeed(`All good, your files looks great!`)
spinner.stop()
process.exit(0)
