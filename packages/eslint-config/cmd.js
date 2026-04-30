#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { Option, program } from 'commander'

import { gray, green, Log } from '@kitql/helpers'

import { findFileOrUp } from './helper/findFileOrUp.js'
import {
	buildEslintCmd,
	buildOxfmtCmd,
	buildOxlintCmd,
	buildPrettierCmd,
} from './src/buildCommands.js'

/** @type {('eslint' | 'prettier' | 'oxlint' | 'tsgolint' | 'oxfmt')[]} */
const TOOLS_ALL = ['eslint', 'prettier', 'oxlint', 'tsgolint', 'oxfmt']
const TOOLS_DEFAULT = ['eslint', 'prettier']

program.addOption(new Option('-f, --format', 'format'))
program.addOption(new Option('-g, --glob <type>', 'file/dir/glob').default('.'))
program.addOption(
	new Option(
		'-t, --tools <type>',
		'tools to use (eslint, prettier, oxlint, tsgolint, oxfmt)',
	).default(TOOLS_DEFAULT.join(',')),
)
program.addOption(new Option('-v, --verbose', 'add more logs').default(false))
program.addOption(
	new Option('-d, --diff-only', 'only check files changed against base branch').default(false),
)
program.addOption(
	new Option('-b, --base-branch <type>', 'base branch to compare against').default('main'),
)
program.addOption(
	new Option('-p, --prefix <type>', 'prefix by with "pnpm" or "npm" or "none"').default('none'),
)
program.parse(process.argv)
const options_cli = program.opts()

const pathPrettierIgnore = findFileOrUp('.prettierignore')
const pathPrettier_js = findFileOrUp('.prettierrc.js')
const pathOxfmtrc = findFileOrUp('.oxfmtrc.json')

const format = /** @type {boolean} */ (options_cli.format ?? false)
let glob = /** @type {string} */ (options_cli.glob ?? '.')
const verbose = /** @type {boolean} */ (options_cli.verbose ?? false)
const pre = /** @type {string} */ (options_cli.prefix ?? 'none')
const tools = /** @type {typeof TOOLS_ALL} */ (options_cli.tools.split(',') ?? TOOLS_DEFAULT)
const unknown = tools.filter((t) => !TOOLS_ALL.includes(t))
if (unknown.length > 0) {
	console.error(`Unknown tool(s): ${unknown.join(', ')}. Supported: ${TOOLS_ALL.join(', ')}`)
	process.exit(2)
}
const diffOnly = /** @type {boolean} */ (options_cli.diffOnly ?? false)
const baseBranch = /** @type {string} */ (options_cli.baseBranch ?? 'main')

const log = new Log('kitql-lint')
// const spinner = new Spinner({ symbolFormatter: (msg) => bgBlueBright(` kitql-lint `) + ' ' + msg })
// spinner.start()
// spinner.setText('Action: ' + green(format ? 'formatting' : 'linting'))
log.info('Action: ' + green(format ? 'formatting' : 'linting'))

let preToUse = ''
if (pre === 'npm') {
	preToUse = 'npm exec '
} else if (pre === 'pnpm') {
	preToUse = 'pnpm '
} else {
	preToUse = ''
}

async function customSpawn(/** @type {string} */ cmd) {
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
		child.on('error', reject)
	})

	if (exitCode) {
		// throw new Error(`subprocess error exit ${exitCode}, ${error}`)
		return { status: exitCode, error }
	}
	return data
}

let filesLength = -1
async function getDiffFiles() {
	log.info(
		verbose ? 'git diff ' + gray(`(getting changed files against ${baseBranch})`) : 'git diff',
	)

	// First, get the git repository root
	let gitRootPath = ''
	try {
		const gitRootCmd = 'git rev-parse --show-toplevel'
		const gitRootChild = spawn(gitRootCmd, {
			shell: true,
			cwd: process.cwd(),
		})

		let rootData = ''
		for await (const chunk of gitRootChild.stdout) {
			rootData += chunk
		}

		const gitRootExitCode = await new Promise((resolve) => {
			gitRootChild.on('close', resolve)
		})

		if (gitRootExitCode === 0) {
			gitRootPath = rootData.trim()
		} else {
			log.error('Could not determine git repository root')
			return null
		}
	} catch (error) {
		if (error instanceof Error) log.error(`Error getting git root: ${error.message}`)
		return null
	}

	// Try to find the best base branch to compare against
	const possibleBranches = [baseBranch, 'main', 'HEAD~1']
	let validBranch = null

	for (const branch of possibleBranches) {
		try {
			// Check if the branch exists
			const checkBranchCmd = `git rev-parse --verify ${branch}`
			const checkBranchChild = spawn(checkBranchCmd, {
				shell: true,
				cwd: process.cwd(),
			})

			const branchExitCode = await new Promise((resolve) => {
				checkBranchChild.on('close', resolve)
			})

			if (branchExitCode === 0) {
				validBranch = branch
				if (verbose && branch !== baseBranch) {
					log.info(`Using '${branch}' as base branch instead of '${baseBranch}'`)
				}
				break
			}
		} catch (error) {
			// Continue to next branch
		}
	}

	if (!validBranch) {
		// If in CI, try to use a different approach
		if (process.env.CI) {
			try {
				// In CI, we can try to get all staged and unstaged changes
				validBranch = 'HEAD'
				if (verbose) {
					log.info('In CI environment, checking all changes')
				}
			} catch (error) {
				log.error(`Could not find a valid base branch to compare against`)
				return null
			}
		} else {
			log.error(`Could not find a valid base branch to compare against`)
			return null
		}
	}

	// Now get the changed files
	const cmd = `git diff --name-only --diff-filter=ACMR ${validBranch}`

	try {
		const child = spawn(cmd, {
			shell: true,
			cwd: process.cwd(),
		})

		let data = ''
		for await (const chunk of child.stdout) {
			data += chunk
		}

		let error = ''
		for await (const chunk of child.stderr) {
			error += chunk
		}

		const exitCode = await new Promise((resolve) => {
			child.on('close', resolve)
		})

		if (exitCode) {
			// If the diff command failed, try a fallback approach for CI environments
			if (process.env.CI) {
				try {
					// In CI, we can try to get all tracked files that have changes
					const fallbackCmd = 'git ls-files --modified --others --exclude-standard'
					const fallbackChild = spawn(fallbackCmd, {
						shell: true,
						cwd: process.cwd(),
					})

					let fallbackData = ''
					for await (const chunk of fallbackChild.stdout) {
						fallbackData += chunk
					}

					const fallbackExitCode = await new Promise((resolve) => {
						fallbackChild.on('close', resolve)
					})

					if (fallbackExitCode === 0 && fallbackData.trim()) {
						data = fallbackData
						if (verbose) {
							log.info('Using fallback method to get changed files in CI')
						}
					} else {
						log.error(`Could not get changed files: ${error}`)
						return null
					}
				} catch {
					log.error(`Could not get changed files: ${error}`)
					return null
				}
			} else {
				log.error(`Could not get changed files: ${error}`)
				return null
			}
		}

		// Get the current working directory
		const cwd = process.cwd()

		// Process the files to make them relative to the current working directory
		const files = data
			.trim()
			.split('\n')
			.filter(Boolean)
			.map((file) => {
				// Convert the git path (relative to git root) to an absolute path
				const absolutePath = path.join(gitRootPath, file)

				// Convert the absolute path to a path relative to the current working directory
				const relativePath = path.relative(cwd, absolutePath)

				// Check if the file exists and is at or below the current directory
				if (fs.existsSync(relativePath) && !relativePath.startsWith('..')) {
					return relativePath
				}
				return null
			})
			.filter(Boolean) // Remove null entries (files not at or below current directory)

		filesLength = files.length
		if (verbose) {
			log.info(`Found ${filesLength} changed files at or below current directory`)
		}

		// Format the files for the command line, wrapping each in quotes and joining with spaces
		return files.length > 0 ? files.map((f) => `'${f}'`).join(' ') : null
	} catch (error) {
		if (error instanceof Error) log.error(`Error getting changed files: ${error.message}`)
		return null
	}
}

function buildOpts() {
	return {
		tools,
		format,
		glob,
		pre: preToUse,
		pathPrettierIgnore,
		pathPrettier_js,
		pathOxfmtrc,
	}
}

async function runOxc(/** @type {string} */ name) {
	const cmdLint = buildOxlintCmd(buildOpts())
	log.info(gray(`${verbose ? cmdLint : name} `))
	return customSpawn(cmdLint)
}

async function runEslint() {
	const cmd = buildEslintCmd(buildOpts())
	log.info(gray(`${verbose ? cmd : 'eslint'} `))
	return customSpawn(cmd)
}

async function runPrettier() {
	const cmd = buildPrettierCmd(buildOpts())
	const svelteOnly = tools.includes('oxfmt')
	log.info(gray(`${verbose ? cmd : svelteOnly ? 'prettier (svelte)' : 'prettier'} `))
	return customSpawn(cmd)
}

async function runOxfmt() {
	const cmd = buildOxfmtCmd(buildOpts())
	log.info(gray(`${verbose ? cmd : 'oxfmt'} `))
	return customSpawn(cmd)
}

/** @type {string[]} */
const took = []

/**
 * @param {string} text
 * @param {number} time
 */
const display = (text, time) => {
	return `${gray(text)} ${green((time / 1000).toFixed(3))}${gray('s')}`
}
const displayTook = () => `${gray('(')}${took.join(gray(', '))}${gray(')')}`

// If changed-only flag is set, get the list of changed files
if (diffOnly) {
	const changedFilesStart = performance.now()
	const changedFiles = await getDiffFiles()
	const changedFilesTook = performance.now() - changedFilesStart
	took.push(display('diff', changedFilesTook))

	if (changedFiles) {
		glob = changedFiles
	} else {
		glob = ''
	}
}

// yes, when we have tsgolint, we need to run oxlint too...
if ((tools.includes('oxlint') || tools.includes('tsgolint')) && glob) {
	const start = performance.now()
	const name = tools.includes('tsgolint') ? 'oxlint (+type)' : 'oxlint'
	const code = await runOxc(name)
	const stepTook = performance.now() - start
	took.push(display(name, stepTook))
	if (typeof code === 'object' && 'status' in code && code.status) {
		log.error(`lint failed, check logs above. ${displayTook()}`)
		process.exit(Number(code.status))
	}
}

if (tools.includes('eslint') && glob) {
	const start = performance.now()
	const code = await runEslint()
	const stepTook = performance.now() - start
	took.push(display('eslint', stepTook))
	if (typeof code === 'object' && 'status' in code && code.status) {
		log.error(`lint failed, check logs above. ${displayTook()}`)
		process.exit(Number(code.status))
	}
}

if (tools.includes('oxfmt') && glob) {
	const start = performance.now()
	const code = await runOxfmt()
	const stepTook = performance.now() - start
	took.push(display('oxfmt', stepTook))
	if (typeof code === 'object' && 'status' in code && code.status) {
		log.error(`format failed, check logs above. ${displayTook()}`)
		process.exit(Number(code.status))
	}
}

if (tools.includes('prettier') && glob) {
	const start = performance.now()
	const code = await runPrettier()
	const stepTook = performance.now() - start
	took.push(display(tools.includes('oxfmt') ? 'prettier (svelte)' : 'prettier', stepTook))
	if (typeof code === 'object' && 'status' in code && code.status) {
		log.error(`format failed, check logs above. ${displayTook()}`)
		process.exit(Number(code.status))
	}
}

log.success(
	`All good, ` +
		`${
			glob === ''
				? 'nothing to do!'
				: filesLength !== -1
					? `your ${filesLength === 1 ? 'single file' : `${filesLength} files`} looks great!`
					: 'your files looks great!'
		} ` +
		displayTook(),
)
process.exit(0)
