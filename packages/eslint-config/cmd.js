#!/usr/bin/env node
import { spawn, spawnSync } from 'child_process'
import { program, Option } from 'commander'
import fs from 'fs'

program.addOption(new Option('-f, --format', 'format'))

program.parse(process.argv)
const options_cli = program.opts()

// console.info(`options_cli`, options_cli)

let pathPrettierIgnore = ''
try {
  fs.statSync('.prettierignore')
  pathPrettierIgnore = '.prettierignore'
} catch (error) {
  try {
    fs.statSync('../../.prettierignore')
    pathPrettierIgnore = '../../.prettierignore'
  } catch (error) {
    // Still nothing
  }
}
if (!pathPrettierIgnore) {
  console.error(`.prettierignore not found`)
  process.exit(0)
}

let pathPrettierCjs = ''
try {
  fs.statSync('.prettierrc.cjs')
  pathPrettierCjs = '.prettierrc.cjs'
} catch (error) {
  try {
    fs.statSync('../../.prettierrc.cjs')
    pathPrettierCjs = '../../.prettierrc.cjs'
  } catch (error) {
    // Still nothing
  }
}
if (!pathPrettierCjs) {
  console.error(`.prettierrc.cjs not found`)
  process.exit(0)
}

// --config <path>

const format = options_cli.format ?? false

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
  ` .`
spawnSync(cmdPrettier, {
  shell: true,
  // cwd: process.cwd(),
  stdio: 'inherit',
})

// Then eslint
const cmdEsLint =
  `eslint` +
  // ignore?
  ` --ignore-path ${pathPrettierIgnore}` +
  // format or not
  `${format ? ' --fix' : ''} ` +
  // exec
  ` .`
spawnSync(cmdEsLint, {
  shell: true,
  // cwd: process.cwd(),
  stdio: 'inherit',
})

// console.log(`cmdPrettier`, cmdPrettier)
// console.log(`cmdEsLint`, cmdEsLint)
