#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { gray, green, Log } from '@kitql/helpers'
import { parseCli } from '@kitql/helpers/server'

import { findFileOrUp } from './helper/findFileOrUp.js'
import {
	baseCandidates,
	buildEslintCmd,
	buildOxfmtCmd,
	buildOxlintCmd,
	chunkFiles,
} from './src/buildCommands.js'

/** @type {('eslint' | 'oxlint' | 'tsgolint' | 'oxfmt')[]} */
const TOOLS_ALL = ['eslint', 'oxlint', 'tsgolint', 'oxfmt']
const TOOLS_DEFAULT = ['eslint', 'oxfmt']

const { values: options_cli, help } = parseCli({
	name: 'kitql-lint',
	options: {
		format: { type: 'boolean', short: 'f', description: 'format' },
		glob: { type: 'string', short: 'g', default: '.', description: 'file/dir/glob' },
		tools: {
			type: 'string',
			short: 't',
			default: TOOLS_DEFAULT.join(','),
			description: 'tools to use (eslint, oxlint, tsgolint, oxfmt)',
		},
		verbose: { type: 'boolean', short: 'v', default: false, description: 'add more logs' },
		'diff-only': {
			type: 'boolean',
			short: 'd',
			default: false,
			description: 'only check files changed against base branch',
		},
		'base-branch': {
			type: 'string',
			short: 'b',
			description: 'base to compare against (default: origin/main, else main)',
		},
		prefix: {
			type: 'string',
			short: 'p',
			default: 'none',
			description: 'prefix by with "pnpm" or "npm" or "none"',
		},
	},
})

if (options_cli.help) {
	console.info(help)
	process.exit(0)
}

const format = /** @type {boolean} */ (options_cli.format ?? false)
const glob = /** @type {string} */ (options_cli.glob ?? '.')
const verbose = /** @type {boolean} */ (options_cli.verbose ?? false)
const pre = /** @type {string} */ (options_cli.prefix ?? 'none')
const tools = /** @type {typeof TOOLS_ALL} */ (
	String(options_cli.tools ?? TOOLS_DEFAULT.join(',')).split(',')
)
const unknown = tools.filter((t) => !TOOLS_ALL.includes(t))
if (unknown.length > 0) {
	console.error(`Unknown tool(s): ${unknown.join(', ')}. Supported: ${TOOLS_ALL.join(', ')}`)
	if (unknown.includes('prettier'))
		console.error('prettier was dropped, oxfmt formats every file type')
	process.exit(2)
}
// Only probe configs of selected tools: findFileOrUp logs when a file is missing
const useOxfmt = tools.includes('oxfmt')
const pathPrettierIgnore = useOxfmt ? findFileOrUp('.prettierignore') : null
const pathOxfmtrc = useOxfmt ? findFileOrUp(['oxfmt.config.ts', '.oxfmtrc.json']) : null

const diffOnly = /** @type {boolean} */ (options_cli['diff-only'] ?? false)
const baseBranch = /** @type {string | undefined} */ (options_cli['base-branch'])

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
		// code is null when killed by a signal: that is a failure too
		child.on('close', (code) => resolve(code ?? 1))
		child.on('error', reject)
	})

	if (exitCode) {
		// throw new Error(`subprocess error exit ${exitCode}, ${error}`)
		return { status: exitCode, error }
	}
	return data
}

/** Run without a shell, so refs need no quoting. */
function git(/** @type {string[]} */ ...args) {
	const { status, stdout } = spawnSync('git', args, { cwd: process.cwd(), encoding: 'utf8' })
	return status === 0 ? stdout.trim() : null
}

let filesLength = -1
async function getDiffFiles() {
	log.info(
		verbose
			? 'git diff ' + gray(`(getting changed files against ${baseBranch ?? 'origin/main'})`)
			: 'git diff',
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
	const possibleBranches = baseCandidates(baseBranch)
	let validBranch = possibleBranches.find((branch) => git('rev-parse', '--verify', branch) !== null)
	if (verbose && validBranch && validBranch !== possibleBranches[0]) {
		log.info(`Using '${validBranch}' as base branch instead of '${possibleBranches[0]}'`)
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
	// Fork point, so upstream commits are not reported as ours. Shallow clones have none: diff directly.
	const diffBase = git('merge-base', validBranch, 'HEAD') ?? validBranch

	try {
		// Against the working tree, not `...`: uncommitted changes count
		const child = spawn('git', ['diff', '--name-only', '--diff-filter=ACMR', diffBase], {
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

				// Only real files at or below cwd: git lists a symlink as one path, and a symlinked
				// directory handed to eslint fails the whole run ("all files ... are ignored").
				if (
					!relativePath.startsWith('..') &&
					fs.statSync(relativePath, { throwIfNoEntry: false })?.isFile()
				) {
					return relativePath
				}
				return null
			})
			.filter(Boolean) // Remove null entries (files not at or below current directory)

		filesLength = files.length
		if (verbose) {
			log.info(`Found ${filesLength} changed files at or below current directory`)
		}

		return chunkFiles(files)
	} catch (error) {
		if (error instanceof Error) log.error(`Error getting changed files: ${error.message}`)
		return null
	}
}

/**
 * Every target runs, so one failing chunk does not hide the others' reports.
 * @param {string} name
 * @param {(opts: import('./src/buildCommands.js').BuildOptions) => string} buildCmd
 */
async function runTargets(name, buildCmd) {
	let failure
	for (const target of targets) {
		const cmd = buildCmd({
			tools,
			format,
			glob: target,
			pre: preToUse,
			pathPrettierIgnore: pathPrettierIgnore ?? undefined,
			pathOxfmtrc: pathOxfmtrc ?? undefined,
			allowUnmatched: diffOnly,
		})
		log.info(gray(`${verbose ? cmd : name} `))
		const result = await customSpawn(cmd)
		if (typeof result === 'object') failure ??= result
	}
	return failure
}

/** @type {string[]} */
const took = []

let targets = glob ? [glob] : []

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
	targets = (await getDiffFiles()) ?? []
	const changedFilesTook = performance.now() - changedFilesStart
	took.push(display('diff', changedFilesTook))
}

// yes, when we have tsgolint, we need to run oxlint too...
if ((tools.includes('oxlint') || tools.includes('tsgolint')) && targets.length > 0) {
	const start = performance.now()
	const name = tools.includes('tsgolint') ? 'oxlint (+type)' : 'oxlint'
	const code = await runTargets(name, buildOxlintCmd)
	const stepTook = performance.now() - start
	took.push(display(name, stepTook))
	if (code) {
		log.error(`lint failed, check logs above. ${displayTook()}`)
		process.exit(Number(code.status))
	}
}

if (tools.includes('eslint') && targets.length > 0) {
	const start = performance.now()
	const code = await runTargets('eslint', buildEslintCmd)
	const stepTook = performance.now() - start
	took.push(display('eslint', stepTook))
	if (code) {
		log.error(`lint failed, check logs above. ${displayTook()}`)
		process.exit(Number(code.status))
	}
}

if (tools.includes('oxfmt') && targets.length > 0) {
	const start = performance.now()
	const code = await runTargets('oxfmt', buildOxfmtCmd)
	const stepTook = performance.now() - start
	took.push(display('oxfmt', stepTook))
	if (code) {
		log.error(`format failed, check logs above. ${displayTook()}`)
		process.exit(Number(code.status))
	}
}

log.success(
	`All good, ` +
		`${
			targets.length === 0
				? 'nothing to do!'
				: filesLength !== -1
					? `your ${filesLength === 1 ? 'single file' : `${filesLength} files`} looks great!`
					: 'your files looks great!'
		} ` +
		displayTook(),
)
process.exit(0)
