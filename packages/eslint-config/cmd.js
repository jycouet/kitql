#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { Option, program } from 'commander'
import ora from 'ora'

import { bgBlueBright, bgGreen, bgRedBright, gray, green, red } from '@kitql/helpers'

import { findFileOrUp } from './helper/findFileOrUp.js'

// df
const spinner = ora({
	// hideCursor: true,
	prefixText: bgBlueBright(` kitql-lint `),
	text: 'check config',
})
spinner.start()

program.addOption(new Option('-f, --format', 'format'))
program.addOption(new Option('-g, --glob <type>', 'file/dir/glob (. by default)', '.'))
program.addOption(new Option('--eslint-only', 'only run eslint', false))
program.addOption(new Option('--prettier-only', 'only run prettier', false))
program.addOption(new Option('--verbose', 'add more logs', false))
program.addOption(
	new Option('-d, --diff-only', 'only check files changed against base branch', false),
)
program.addOption(
	new Option('--base-branch <type>', 'base branch to compare against (default: main)', 'main'),
)
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
const pathPrettier_js = findFileOrUp('.prettierrc.js')

const format = options_cli.format ?? false
let glob = options_cli.glob ?? '.'
const verbose = options_cli.verbose ?? false
const pre = options_cli.prefix ?? 'none'
const eslintOnly = options_cli.eslintOnly ?? false
const prettierOnly = options_cli.prettierOnly ?? false
const diffOnly = options_cli.diffOnly ?? false
const baseBranch = options_cli.baseBranch ?? 'main'

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

let filesLength = -1
async function getDiffFiles() {
	spinner.text = verbose
		? 'git diff ' + gray(`(getting changed files against ${baseBranch})`)
		: 'git diff'

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
			spinner.warn('Could not determine git repository root')
			return null
		}
	} catch (error) {
		spinner.warn(`Error getting git root: ${error.message}`)
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
					spinner.info(`Using '${branch}' as base branch instead of '${baseBranch}'`)
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
					spinner.info('In CI environment, checking all changes')
				}
			} catch (error) {
				spinner.warn(`Could not find a valid base branch to compare against`)
				return null
			}
		} else {
			spinner.warn(`Could not find a valid base branch to compare against`)
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
							spinner.info('Using fallback method to get changed files in CI')
						}
					} else {
						spinner.warn(`Could not get changed files: ${error}`)
						return null
					}
				} catch (fallbackError) {
					spinner.warn(`Could not get changed files: ${error}`)
					return null
				}
			} else {
				spinner.warn(`Could not get changed files: ${error}`)
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
			spinner.info(`Found ${filesLength} changed files at or below current directory`)
		}

		// Format the files for the command line, wrapping each in quotes and joining with spaces
		return files.length > 0 ? files.map((f) => `'${f}'`).join(' ') : null
	} catch (error) {
		spinner.warn(`Error getting changed files: ${error.message}`)
		return null
	}
}

async function eslintRun() {
	const cmdEsLint =
		preToUse +
		`eslint --no-warn-ignored` +
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
		` --config ${pathPrettier_js}` +
		// format or not
		`${format ? ' --write' : ''}` +
		// exec
		` ${glob}`

	spinner.text = verbose ? 'prettier ' + gray(`(${cmdPrettier})`) : 'prettier'

	const result_prettier = await customSpawn(cmdPrettier)

	return result_prettier
}

const took = []

const display = (text, time) => {
	return `${gray(text)} ${green((time / 1000).toFixed(3))}${gray('s')}`
}
const displayTook = () => `${gray('(')}${took.join(gray(', '))}${gray(')')}`

// If changed-only flag is set, get the list of changed files
if (diffOnly) {
	spinner.text = 'Checking for changed files'
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

if (!prettierOnly && glob) {
	const esLintStart = performance.now()
	const eslintCode = await eslintRun()
	const esLintTook = performance.now() - esLintStart
	took.push(display('eslint', esLintTook))
	if (eslintCode.status) {
		spinner.prefixText = bgRedBright(` kitql-lint `)
		spinner.fail(red(`eslint failed, check logs above. ${displayTook()}`))
		process.exit(eslintCode.status)
	}
}

if (!eslintOnly && glob) {
	const prettierStart = performance.now()
	const prettierCode = await prettierRun()
	const prettierTook = performance.now() - prettierStart
	took.push(display('prettier', prettierTook))
	if (prettierCode.status) {
		spinner.prefixText = bgRedBright(` kitql-lint `)
		spinner.fail(red(`prettier failed, check logs above. ${displayTook()}`))
		process.exit(prettierCode.status)
	}
}

spinner.prefixText = bgGreen(` kitql-lint `)
spinner.succeed(
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
spinner.stop()
process.exit(0)
